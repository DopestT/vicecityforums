-- Keep clip publication inside ordinary RLS enforcement while allowing an
-- administrator to create the linked discussion on behalf of the submitter.

drop policy if exists threads_member_insert on public.threads;
create policy threads_member_insert on public.threads
for insert to authenticated
with check (
  (select public.is_forum_admin())
  or (
    (select auth.uid()) = author_id
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.onboarded
    )
  )
);

alter function public.publish_clip(uuid) security invoker;

create index if not exists clip_reports_reporter_id_idx
  on public.clip_reports (reporter_id);
