-- ViceWire operator foundation for Vice City Forums
-- Apply this in the Supabase project used by js/app.js before enabling the worker.

create extension if not exists pgcrypto;

create table if not exists public.vicewire_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.vicewire_settings (
  id smallint primary key default 1 check (id = 1),
  enabled boolean not null default false,
  auto_reply boolean not null default false,
  auto_post boolean not null default false,
  auto_moderate boolean not null default true,
  max_jobs_per_run integer not null default 10 check (max_jobs_per_run between 1 and 50),
  public_label text not null default 'VICEWIRE AI',
  last_daily_post_at timestamptz,
  updated_at timestamptz not null default now()
);

insert into public.vicewire_settings (id)
values (1)
on conflict (id) do nothing;

create table if not exists public.vicewire_jobs (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('thread_created','reply_created','manual_prompt','daily_post')),
  source_table text,
  source_id uuid,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'queued' check (status in ('queued','processing','done','failed')),
  attempts integer not null default 0,
  available_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);

create unique index if not exists vicewire_jobs_source_once
on public.vicewire_jobs (kind, source_table, source_id)
where source_id is not null;

create index if not exists vicewire_jobs_queue_idx
on public.vicewire_jobs (status, available_at, created_at);

create table if not exists public.vicewire_actions (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.vicewire_jobs(id) on delete set null,
  action_type text not null check (action_type in ('noop','reply','flag','lock_recommendation','create_thread')),
  target_table text,
  target_id uuid,
  payload jsonb not null default '{}'::jsonb,
  risk_level text not null default 'low' check (risk_level in ('low','medium','high')),
  status text not null default 'pending' check (status in ('pending','executed','approved','rejected','failed')),
  model text,
  reasoning_summary text,
  executed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists vicewire_actions_recent_idx
on public.vicewire_actions (created_at desc);

create or replace function public.is_vicewire_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.vicewire_admins a
    where a.user_id = auth.uid()
  );
$$;

grant execute on function public.is_vicewire_admin() to authenticated;

create or replace function public.vicewire_enqueue_manual(p_kind text, p_payload jsonb default '{}'::jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  if not public.is_vicewire_admin() then
    raise exception 'not authorized';
  end if;

  if p_kind not in ('manual_prompt','daily_post') then
    raise exception 'unsupported job kind';
  end if;

  insert into public.vicewire_jobs(kind, payload)
  values (p_kind, coalesce(p_payload, '{}'::jsonb))
  returning id into new_id;

  return new_id;
end;
$$;

grant execute on function public.vicewire_enqueue_manual(text, jsonb) to authenticated;

create or replace function public.vicewire_queue_forum_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  settings_enabled boolean;
  row_json jsonb;
  event_kind text;
begin
  select enabled into settings_enabled
  from public.vicewire_settings
  where id = 1;

  if coalesce(settings_enabled, false) is false then
    return new;
  end if;

  row_json := to_jsonb(new);

  -- Never feed ViceWire's own public content back into the operator loop.
  if coalesce(row_json->>'demo_author_label', '') = 'VICEWIRE AI' then
    return new;
  end if;

  event_kind := case tg_table_name
    when 'threads' then 'thread_created'
    when 'replies' then 'reply_created'
    else null
  end;

  if event_kind is null then
    return new;
  end if;

  insert into public.vicewire_jobs(kind, source_table, source_id, payload)
  values (event_kind, tg_table_name, new.id, row_json)
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists vicewire_thread_created on public.threads;
create trigger vicewire_thread_created
after insert on public.threads
for each row execute function public.vicewire_queue_forum_event();

drop trigger if exists vicewire_reply_created on public.replies;
create trigger vicewire_reply_created
after insert on public.replies
for each row execute function public.vicewire_queue_forum_event();

alter table public.vicewire_admins enable row level security;
alter table public.vicewire_settings enable row level security;
alter table public.vicewire_jobs enable row level security;
alter table public.vicewire_actions enable row level security;

drop policy if exists "ViceWire admins read settings" on public.vicewire_settings;
create policy "ViceWire admins read settings"
on public.vicewire_settings for select
to authenticated
using (public.is_vicewire_admin());

drop policy if exists "ViceWire admins update settings" on public.vicewire_settings;
create policy "ViceWire admins update settings"
on public.vicewire_settings for update
to authenticated
using (public.is_vicewire_admin())
with check (public.is_vicewire_admin());

drop policy if exists "ViceWire admins read jobs" on public.vicewire_jobs;
create policy "ViceWire admins read jobs"
on public.vicewire_jobs for select
to authenticated
using (public.is_vicewire_admin());

drop policy if exists "ViceWire admins insert jobs" on public.vicewire_jobs;
create policy "ViceWire admins insert jobs"
on public.vicewire_jobs for insert
to authenticated
with check (public.is_vicewire_admin());

drop policy if exists "ViceWire admins update jobs" on public.vicewire_jobs;
create policy "ViceWire admins update jobs"
on public.vicewire_jobs for update
to authenticated
using (public.is_vicewire_admin())
with check (public.is_vicewire_admin());

drop policy if exists "ViceWire admins read actions" on public.vicewire_actions;
create policy "ViceWire admins read actions"
on public.vicewire_actions for select
to authenticated
using (public.is_vicewire_admin());

drop policy if exists "ViceWire admins update actions" on public.vicewire_actions;
create policy "ViceWire admins update actions"
on public.vicewire_actions for update
to authenticated
using (public.is_vicewire_admin())
with check (public.is_vicewire_admin());

grant select, update on public.vicewire_settings to authenticated;
grant select, insert, update on public.vicewire_jobs to authenticated;
grant select, update on public.vicewire_actions to authenticated;

comment on table public.vicewire_actions is 'Auditable ViceWire decisions. reasoning_summary is a concise operator explanation, never private model chain-of-thought.';
