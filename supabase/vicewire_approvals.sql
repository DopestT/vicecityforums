-- Admin approval functions for ViceWire pending actions.
-- Apply after supabase/vicewire.sql.

create or replace function public.vicewire_approve_action(p_action_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  a public.vicewire_actions%rowtype;
  label text;
begin
  if not public.is_vicewire_admin() then
    raise exception 'not authorized';
  end if;

  select * into a
  from public.vicewire_actions
  where id = p_action_id
  for update;

  if not found then
    raise exception 'action not found';
  end if;

  if a.status <> 'pending' then
    raise exception 'action is not pending';
  end if;

  select public_label into label
  from public.vicewire_settings
  where id = 1;

  if a.action_type = 'reply' then
    if coalesce(a.payload->>'thread_id', '') = '' or coalesce(a.payload->>'reply', '') = '' then
      raise exception 'reply action is missing thread_id or reply text';
    end if;

    insert into public.replies(thread_id, author_id, body, is_demo, demo_author_label)
    values (
      (a.payload->>'thread_id')::uuid,
      null,
      a.payload->>'reply',
      true,
      coalesce(label, 'VICEWIRE AI')
    );

    update public.vicewire_actions
    set status = 'executed', executed_at = now()
    where id = p_action_id;

  elsif a.action_type = 'lock_recommendation' then
    if a.target_table <> 'threads' or a.target_id is null then
      raise exception 'lock recommendation has no thread target';
    end if;

    update public.threads
    set is_locked = true
    where id = a.target_id;

    update public.vicewire_actions
    set status = 'executed', executed_at = now()
    where id = p_action_id;

  elsif a.action_type = 'flag' then
    -- A flag approval is an owner acknowledgment in V1. No destructive action is automatic.
    update public.vicewire_actions
    set status = 'approved'
    where id = p_action_id;

  else
    update public.vicewire_actions
    set status = 'approved'
    where id = p_action_id;
  end if;
end;
$$;

grant execute on function public.vicewire_approve_action(uuid) to authenticated;

create or replace function public.vicewire_reject_action(p_action_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_vicewire_admin() then
    raise exception 'not authorized';
  end if;

  update public.vicewire_actions
  set status = 'rejected'
  where id = p_action_id
    and status = 'pending';
end;
$$;

grant execute on function public.vicewire_reject_action(uuid) to authenticated;
