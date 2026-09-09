-- Anonymous readers should never need permission to call the admin helper.
-- Keep guest and signed-in visibility in separate RLS policies.

drop policy if exists clips_public_owner_admin_read on public.clips;

create policy clips_public_read on public.clips
for select to anon
using (status = 'published');

create policy clips_member_owner_admin_read on public.clips
for select to authenticated
using (
  status = 'published'
  or (select auth.uid()) = uploader_id
  or (select public.is_forum_admin())
);
