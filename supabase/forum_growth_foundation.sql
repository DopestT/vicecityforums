-- Production hardening for a public forum that is expected to grow.
-- Applied to project mzqplhhtsnahxghxpwcd as forum_growth_foundation.

create index if not exists threads_author_id_idx
  on public.threads (author_id);

create index if not exists replies_author_id_idx
  on public.replies (author_id);

create or replace function public.is_forum_admin()
returns boolean
language sql
stable
set search_path = public
as $$
  select coalesce(
    (select is_admin from public.profiles where id = (select auth.uid())),
    false
  );
$$;

create or replace function public.protect_thread_system_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Nested updates from the reply-metrics trigger are trusted.
  if pg_trigger_depth() > 1 then
    return new;
  end if;

  -- Service-role and migration work has no end-user auth UID.
  if auth.uid() is null or public.is_forum_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.is_pinned := false;
    new.is_locked := false;
    new.is_demo := false;
    new.demo_author_label := null;
    new.reply_count := 0;
    new.created_at := now();
    new.updated_at := new.created_at;
    new.last_activity_at := new.created_at;
    return new;
  end if;

  if new.author_id is distinct from old.author_id
    or new.is_pinned is distinct from old.is_pinned
    or new.is_locked is distinct from old.is_locked
    or new.is_demo is distinct from old.is_demo
    or new.demo_author_label is distinct from old.demo_author_label
    or new.reply_count is distinct from old.reply_count
    or new.last_activity_at is distinct from old.last_activity_at
    or new.created_at is distinct from old.created_at
    or new.updated_at is distinct from old.updated_at then
    raise exception 'forum-managed thread fields cannot be changed by this user';
  end if;

  return new;
end;
$$;

create or replace function public.protect_reply_system_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or public.is_forum_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.is_demo := false;
    new.demo_author_label := null;
    new.created_at := now();
    new.updated_at := new.created_at;
    return new;
  end if;

  if new.thread_id is distinct from old.thread_id
    or new.author_id is distinct from old.author_id
    or new.is_demo is distinct from old.is_demo
    or new.demo_author_label is distinct from old.demo_author_label
    or new.created_at is distinct from old.created_at
    or new.updated_at is distinct from old.updated_at then
    raise exception 'forum-managed reply fields cannot be changed by this user';
  end if;

  return new;
end;
$$;

revoke all on function public.protect_thread_system_fields() from public, anon, authenticated;
revoke all on function public.protect_reply_system_fields() from public, anon, authenticated;

drop trigger if exists threads_protect_system_fields on public.threads;
create trigger threads_protect_system_fields
before insert or update on public.threads
for each row execute function public.protect_thread_system_fields();

drop trigger if exists replies_protect_system_fields on public.replies;
create trigger replies_protect_system_fields
before insert or update on public.replies
for each row execute function public.protect_reply_system_fields();

create or replace function public.sync_thread_reply_metrics()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op in ('INSERT', 'UPDATE') then
    update public.threads t
       set reply_count = (select count(*)::integer from public.replies r where r.thread_id = new.thread_id),
           last_activity_at = greatest(
             t.created_at,
             coalesce((select max(r.created_at) from public.replies r where r.thread_id = new.thread_id), t.created_at)
           )
     where t.id = new.thread_id;
  end if;

  if tg_op = 'DELETE'
     or (tg_op = 'UPDATE' and old.thread_id is distinct from new.thread_id) then
    update public.threads t
       set reply_count = (select count(*)::integer from public.replies r where r.thread_id = old.thread_id),
           last_activity_at = greatest(
             t.created_at,
             coalesce((select max(r.created_at) from public.replies r where r.thread_id = old.thread_id), t.created_at)
           )
     where t.id = old.thread_id;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

revoke all on function public.sync_thread_reply_metrics() from public, anon, authenticated;

drop trigger if exists replies_bump_thread_insert on public.replies;
drop trigger if exists replies_bump_thread_delete on public.replies;
drop trigger if exists replies_sync_thread_metrics on public.replies;

create trigger replies_sync_thread_metrics
after insert or delete or update of thread_id, created_at on public.replies
for each row execute function public.sync_thread_reply_metrics();

drop function if exists public.bump_thread_on_reply();

update public.threads t
   set reply_count = (select count(*)::integer from public.replies r where r.thread_id = t.id),
       last_activity_at = greatest(
         t.created_at,
         coalesce((select max(r.created_at) from public.replies r where r.thread_id = t.id), t.created_at)
       );

-- Wrap auth.uid() so Postgres evaluates it once per statement instead of once per row.
drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
for update to authenticated
using (((select auth.uid()) = id) or (select public.is_forum_admin()))
with check (((select auth.uid()) = id) or (select public.is_forum_admin()));

drop policy if exists threads_member_insert on public.threads;
create policy threads_member_insert on public.threads
for insert to authenticated
with check (
  (select auth.uid()) = author_id
  and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.onboarded
  )
);

drop policy if exists threads_owner_update on public.threads;
create policy threads_owner_update on public.threads
for update to authenticated
using (((select auth.uid()) = author_id) or (select public.is_forum_admin()))
with check (((select auth.uid()) = author_id) or (select public.is_forum_admin()));

drop policy if exists threads_owner_delete on public.threads;
create policy threads_owner_delete on public.threads
for delete to authenticated
using (((select auth.uid()) = author_id) or (select public.is_forum_admin()));

drop policy if exists replies_member_insert on public.replies;
create policy replies_member_insert on public.replies
for insert to authenticated
with check (
  (select auth.uid()) = author_id
  and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.onboarded
  )
  and (
    (select public.is_forum_admin())
    or exists (
      select 1 from public.threads t
      where t.id = replies.thread_id and not t.is_locked
    )
  )
);

drop policy if exists replies_owner_update on public.replies;
create policy replies_owner_update on public.replies
for update to authenticated
using (((select auth.uid()) = author_id) or (select public.is_forum_admin()))
with check (((select auth.uid()) = author_id) or (select public.is_forum_admin()));

drop policy if exists replies_owner_delete on public.replies;
create policy replies_owner_delete on public.replies
for delete to authenticated
using (((select auth.uid()) = author_id) or (select public.is_forum_admin()));

-- Avoid a redundant SELECT policy created by an ALL policy on categories.
drop policy if exists categories_admin_write on public.categories;
drop policy if exists categories_admin_insert on public.categories;
drop policy if exists categories_admin_update on public.categories;
drop policy if exists categories_admin_delete on public.categories;

create policy categories_admin_insert on public.categories
for insert to authenticated
with check ((select public.is_forum_admin()));

create policy categories_admin_update on public.categories
for update to authenticated
using ((select public.is_forum_admin()))
with check ((select public.is_forum_admin()));

create policy categories_admin_delete on public.categories
for delete to authenticated
using ((select public.is_forum_admin()));
