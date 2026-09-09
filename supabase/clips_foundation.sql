-- Native VCF Clips foundation.
-- Adds a provenance-gated video feed, private per-member engagement,
-- reporting, and atomic publication into the Clips & Compilations forum.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists public.clips (
  id uuid primary key default gen_random_uuid(),
  uploader_id uuid references public.profiles(id) on delete set null,
  thread_id uuid unique references public.threads(id) on delete set null,
  slug text not null unique,
  title text not null,
  description text not null default '',
  video_url text not null,
  poster_url text,
  source_type text not null,
  source_url text not null,
  creator_credit text not null,
  captured_at date,
  provider text not null default 'external',
  provider_uid text,
  duration_seconds numeric(8,2),
  status text not null default 'pending_review',
  rights_attested boolean not null default false,
  disclosure text not null default '',
  moderation_note text not null default '',
  is_featured boolean not null default false,
  like_count integer not null default 0,
  save_count integer not null default 0,
  report_count integer not null default 0,
  published_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint clips_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(slug) between 3 and 100),
  constraint clips_title_length check (char_length(title) between 4 and 140),
  constraint clips_description_length check (char_length(description) <= 2000),
  constraint clips_video_url_https check (video_url ~ '^https://'),
  constraint clips_poster_url_https check (poster_url is null or poster_url ~ '^https://'),
  constraint clips_source_url_https check (source_url ~ '^https://'),
  constraint clips_creator_credit_length check (char_length(creator_credit) between 2 and 160),
  constraint clips_source_type_valid check (source_type in ('official-rockstar','user-gameplay','fan-made','ai-generated')),
  constraint clips_provider_valid check (provider in ('external','cloudflare','youtube')),
  constraint clips_provider_uid_present check (provider = 'external' or nullif(provider_uid, '') is not null),
  constraint clips_duration_valid check (duration_seconds is null or duration_seconds > 0 and duration_seconds <= 600),
  constraint clips_status_valid check (status in ('uploading','processing','pending_review','published','rejected','failed')),
  constraint clips_counts_nonnegative check (like_count >= 0 and save_count >= 0 and report_count >= 0),
  constraint clips_published_rights check (status <> 'published' or rights_attested),
  constraint clips_published_timestamp check (status <> 'published' or published_at is not null),
  constraint clips_synthetic_disclosure check (source_type not in ('fan-made','ai-generated') or char_length(disclosure) > 0),
  constraint clips_gameplay_release_gate check (source_type <> 'user-gameplay' or (captured_at is not null and captured_at >= date '2026-11-19')),
  constraint clips_synthetic_title_gate check (
    source_type not in ('fan-made','ai-generated')
    or title !~* '\m(gameplay|playing|playthrough|walkthrough|first[- ]person|third[- ]person|3rd[- ]person)\M'
  )
);

create table if not exists public.clip_engagements (
  clip_id uuid not null references public.clips(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  liked boolean not null default false,
  saved boolean not null default false,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  primary key (clip_id, user_id),
  constraint clip_engagements_has_action check (liked or saved)
);

create table if not exists public.clip_reports (
  id uuid primary key default gen_random_uuid(),
  clip_id uuid not null references public.clips(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null,
  details text not null default '',
  status text not null default 'open',
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  unique (clip_id, reporter_id),
  constraint clip_reports_reason_valid check (reason in ('copyright','misleading-label','harassment','graphic','spam','other')),
  constraint clip_reports_details_length check (char_length(details) <= 1000),
  constraint clip_reports_status_valid check (status in ('open','reviewed','dismissed'))
);

create index if not exists clips_public_feed_idx
  on public.clips (is_featured desc, published_at desc, id desc)
  where status = 'published';
create index if not exists clips_uploader_created_idx
  on public.clips (uploader_id, created_at desc);
create index if not exists clip_engagements_user_idx
  on public.clip_engagements (user_id, updated_at desc);
create index if not exists clip_reports_open_idx
  on public.clip_reports (created_at desc)
  where status = 'open';

alter table public.clips enable row level security;
alter table public.clip_engagements enable row level security;
alter table public.clip_reports enable row level security;

grant select on public.clips to anon;
grant select, insert, update, delete on public.clips to authenticated;
grant select, insert, update, delete on public.clips to service_role;
revoke all on public.clip_engagements from anon;
grant select, insert, update, delete on public.clip_engagements to authenticated;
grant select, insert, update, delete on public.clip_engagements to service_role;
revoke all on public.clip_reports from anon;
grant select, insert, update, delete on public.clip_reports to authenticated;
grant select, insert, update, delete on public.clip_reports to service_role;

drop policy if exists clips_public_owner_admin_read on public.clips;
create policy clips_public_owner_admin_read on public.clips
for select to anon, authenticated
using (
  status = 'published'
  or (select auth.uid()) = uploader_id
  or (select public.is_forum_admin())
);

drop policy if exists clips_member_insert on public.clips;
create policy clips_member_insert on public.clips
for insert to authenticated
with check (
  (select public.is_forum_admin())
  or (
    (select auth.uid()) = uploader_id
    and rights_attested
    and status = 'pending_review'
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.onboarded
    )
  )
);

drop policy if exists clips_owner_admin_update on public.clips;
create policy clips_owner_admin_update on public.clips
for update to authenticated
using (
  (select public.is_forum_admin())
  or ((select auth.uid()) = uploader_id and status in ('pending_review','rejected'))
)
with check (
  (select public.is_forum_admin())
  or ((select auth.uid()) = uploader_id and status in ('pending_review','rejected') and rights_attested)
);

drop policy if exists clips_owner_admin_delete on public.clips;
create policy clips_owner_admin_delete on public.clips
for delete to authenticated
using (
  (select public.is_forum_admin())
  or ((select auth.uid()) = uploader_id and status <> 'published')
);

drop policy if exists clip_engagements_self_read on public.clip_engagements;
create policy clip_engagements_self_read on public.clip_engagements
for select to authenticated
using ((select auth.uid()) = user_id or (select public.is_forum_admin()));

drop policy if exists clip_engagements_self_insert on public.clip_engagements;
create policy clip_engagements_self_insert on public.clip_engagements
for insert to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.onboarded)
  and exists (select 1 from public.clips c where c.id = clip_id and c.status = 'published')
);

drop policy if exists clip_engagements_self_update on public.clip_engagements;
create policy clip_engagements_self_update on public.clip_engagements
for update to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and exists (select 1 from public.clips c where c.id = clip_id and c.status = 'published')
);

drop policy if exists clip_engagements_self_delete on public.clip_engagements;
create policy clip_engagements_self_delete on public.clip_engagements
for delete to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists clip_reports_self_admin_read on public.clip_reports;
create policy clip_reports_self_admin_read on public.clip_reports
for select to authenticated
using ((select auth.uid()) = reporter_id or (select public.is_forum_admin()));

drop policy if exists clip_reports_member_insert on public.clip_reports;
create policy clip_reports_member_insert on public.clip_reports
for insert to authenticated
with check (
  (select auth.uid()) = reporter_id
  and status = 'open'
  and reviewed_at is null
  and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.onboarded)
  and exists (select 1 from public.clips c where c.id = clip_id and c.status = 'published')
);

drop policy if exists clip_reports_admin_update on public.clip_reports;
create policy clip_reports_admin_update on public.clip_reports
for update to authenticated
using ((select public.is_forum_admin()))
with check ((select public.is_forum_admin()));

drop policy if exists clip_reports_admin_delete on public.clip_reports;
create policy clip_reports_admin_delete on public.clip_reports
for delete to authenticated
using ((select public.is_forum_admin()));

create or replace function public.protect_clip_system_fields()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.source_type = 'user-gameplay'
    and (current_date < date '2026-11-19' or new.captured_at is null or new.captured_at < date '2026-11-19' or new.captured_at > current_date) then
    raise exception 'user gameplay cannot be submitted before launch and must include its real capture date';
  end if;

  if new.source_type = 'ai-generated' then
    new.disclosure := 'AI-GENERATED · NOT GTA VI GAMEPLAY';
  elsif new.source_type = 'fan-made' then
    new.disclosure := 'FAN-MADE CONCEPT · NOT GTA VI GAMEPLAY';
  else
    new.disclosure := '';
  end if;

  -- Nested updates from the engagement/report count triggers are trusted.
  if pg_trigger_depth() > 1 then
    return new;
  end if;

  -- Migrations and service-role work have no end-user auth UID.
  if (select auth.uid()) is null or (select public.is_forum_admin()) then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if (select auth.uid()) is null or new.uploader_id is distinct from (select auth.uid()) then
      raise exception 'clip uploader must match the signed-in member';
    end if;
    new.thread_id := null;
    new.status := 'pending_review';
    new.moderation_note := '';
    new.is_featured := false;
    new.like_count := 0;
    new.save_count := 0;
    new.report_count := 0;
    new.published_at := null;
    new.created_at := now();
    new.updated_at := new.created_at;
    return new;
  end if;

  if old.uploader_id is distinct from (select auth.uid()) then
    raise exception 'only the uploader can edit this clip';
  end if;

  if new.uploader_id is distinct from old.uploader_id
    or new.thread_id is distinct from old.thread_id
    or new.slug is distinct from old.slug
    or new.moderation_note is distinct from old.moderation_note
    or new.is_featured is distinct from old.is_featured
    or new.like_count is distinct from old.like_count
    or new.save_count is distinct from old.save_count
    or new.report_count is distinct from old.report_count
    or new.published_at is distinct from old.published_at
    or new.created_at is distinct from old.created_at then
    raise exception 'forum-managed clip fields cannot be changed by this user';
  end if;

  if new.status is distinct from old.status then
    if old.status = 'rejected' and new.status = 'pending_review' then
      new.moderation_note := '';
    else
      raise exception 'clip review status cannot be changed by this user';
    end if;
  end if;

  return new;
end;
$$;
revoke all on function public.protect_clip_system_fields() from public, anon, authenticated;

drop trigger if exists clips_10_protect_system_fields on public.clips;
create trigger clips_10_protect_system_fields
before insert or update on public.clips
for each row execute function public.protect_clip_system_fields();

drop trigger if exists clips_90_set_updated_at on public.clips;
create trigger clips_90_set_updated_at
before update on public.clips
for each row execute function public.set_updated_at();

drop trigger if exists clip_engagements_set_updated_at on public.clip_engagements;
create trigger clip_engagements_set_updated_at
before update on public.clip_engagements
for each row execute function public.set_updated_at();

create or replace function private.sync_clip_engagement_counts()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_clip_id uuid;
begin
  target_clip_id := case when tg_op = 'DELETE' then old.clip_id else new.clip_id end;
  update public.clips c
  set like_count = (select count(*)::integer from public.clip_engagements e where e.clip_id = target_clip_id and e.liked),
      save_count = (select count(*)::integer from public.clip_engagements e where e.clip_id = target_clip_id and e.saved)
  where c.id = target_clip_id;

  if tg_op = 'UPDATE' and old.clip_id is distinct from new.clip_id then
    update public.clips c
    set like_count = (select count(*)::integer from public.clip_engagements e where e.clip_id = old.clip_id and e.liked),
        save_count = (select count(*)::integer from public.clip_engagements e where e.clip_id = old.clip_id and e.saved)
    where c.id = old.clip_id;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;
revoke all on function private.sync_clip_engagement_counts() from public, anon, authenticated;

drop trigger if exists clip_engagements_sync_counts on public.clip_engagements;
create trigger clip_engagements_sync_counts
after insert or update or delete on public.clip_engagements
for each row execute function private.sync_clip_engagement_counts();

create or replace function private.sync_clip_report_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_clip_id uuid;
begin
  target_clip_id := case when tg_op = 'DELETE' then old.clip_id else new.clip_id end;
  update public.clips c
  set report_count = (
    select count(*)::integer from public.clip_reports r
    where r.clip_id = target_clip_id and r.status = 'open'
  )
  where c.id = target_clip_id;

  if tg_op = 'UPDATE' and old.clip_id is distinct from new.clip_id then
    update public.clips c
    set report_count = (
      select count(*)::integer from public.clip_reports r
      where r.clip_id = old.clip_id and r.status = 'open'
    )
    where c.id = old.clip_id;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;
revoke all on function private.sync_clip_report_count() from public, anon, authenticated;

drop trigger if exists clip_reports_sync_count on public.clip_reports;
create trigger clip_reports_sync_count
after insert or update or delete on public.clip_reports
for each row execute function private.sync_clip_report_count();

create or replace function public.publish_clip(target_clip_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_clip public.clips%rowtype;
  clips_category_id uuid;
  published_thread_id uuid;
  thread_body text;
begin
  if not (select public.is_forum_admin()) then
    raise exception 'administrator access required';
  end if;

  select * into selected_clip
  from public.clips
  where id = target_clip_id
  for update;

  if not found then
    raise exception 'clip not found';
  end if;

  if selected_clip.status = 'published' and selected_clip.thread_id is not null then
    return selected_clip.thread_id;
  end if;

  select id into clips_category_id
  from public.categories
  where slug = 'clips-compilations';

  if clips_category_id is null then
    raise exception 'Clips & Compilations category is missing';
  end if;

  thread_body := selected_clip.description
    || E'\n\nSource label: ' || selected_clip.source_type
    || E'\nCreator credit: ' || selected_clip.creator_credit
    || E'\nOriginal source: ' || selected_clip.source_url
    || E'\n\nWatch: https://vicecityforums.com/#clips/' || selected_clip.slug;

  if selected_clip.thread_id is null then
    insert into public.threads (category_id, author_id, title, body)
    values (
      clips_category_id,
      coalesce(selected_clip.uploader_id, (select auth.uid())),
      selected_clip.title,
      thread_body
    )
    returning id into published_thread_id;
  else
    published_thread_id := selected_clip.thread_id;
  end if;

  update public.clips
  set thread_id = published_thread_id,
      status = 'published',
      published_at = coalesce(published_at, now()),
      moderation_note = ''
  where id = target_clip_id;

  return published_thread_id;
end;
$$;
revoke all on function public.publish_clip(uuid) from public, anon;
grant execute on function public.publish_clip(uuid) to authenticated, service_role;

-- Seed the public feed with official downloadable Rockstar media.
insert into public.clips (
  slug, title, description, video_url, poster_url, source_type, source_url,
  creator_credit, captured_at, provider, duration_seconds, status,
  rights_attested, disclosure, is_featured, published_at
)
values
  (
    'official-cover-art-animation',
    'The Official GTA VI Cover Art Comes Alive',
    'Rockstar’s official animated cover art opens the VCF Clips feed. Which detail in the new artwork stands out first?',
    'https://media-rockstargames-com.akamaized.net/VI/downloads/videos/GTAVI_Official_Cover_Art_Landscape/GTAVI_Official_Cover_Art_Landscape.mp4',
    'https://www.rockstargames.com/VI/_next/static/media/GTAVI_Official_Cover_Art_Landscape.03y6bcce9e2jr.jpg',
    'official-rockstar', 'https://www.rockstargames.com/VI/media/videos', 'Rockstar Games', date '2026-06-25',
    'external', 32.67, 'published', true, '', true, now()
  ),
  (
    'lucia-caminos-official-clip',
    'Lucia Caminos: Official Character Clip',
    'A short official look at Lucia Caminos. What does this moment suggest about her presence in GTA VI?',
    'https://www.rockstargames.com/VI/_next/static/media/Lucia_Caminos_Video_Clip.0g8.3fx84ixw..mp4',
    'https://www.rockstargames.com/VI/_next/static/media/Lucia_Caminos_Video_Clip.0uqwkm_u_fu_9.jpg',
    'official-rockstar', 'https://www.rockstargames.com/VI/media/videos', 'Rockstar Games', date '2025-05-03',
    'external', 1.50, 'published', true, '', true, now() - interval '1 minute'
  ),
  (
    'jason-duval-official-clip',
    'Jason Duval: Official Character Clip',
    'Rockstar’s official Jason Duval character clip. What is your read on Jason so far?',
    'https://www.rockstargames.com/VI/_next/static/media/Jason_Duval_Video_Clip.10.gc09c9y-j9.mp4',
    'https://www.rockstargames.com/VI/_next/static/media/Jason_Duval_Video_Clip.024oe-y640yxp.jpg',
    'official-rockstar', 'https://www.rockstargames.com/VI/media/videos', 'Rockstar Games', date '2025-05-03',
    'external', 1.00, 'published', true, '', false, now() - interval '2 minutes'
  ),
  (
    'cal-hampton-official-clip',
    'Cal Hampton: Official Character Clip',
    'Rockstar’s official Cal Hampton character clip. Where do you think Cal fits into the story?',
    'https://www.rockstargames.com/VI/_next/static/media/Cal_Hampton_Video_Clip.13-520tpb1vbq.mp4',
    'https://www.rockstargames.com/VI/_next/static/media/Cal_Hampton_Video_Clip.127phn-5fdl9r.jpg',
    'official-rockstar', 'https://www.rockstargames.com/VI/media/videos', 'Rockstar Games', date '2025-05-03',
    'external', 1.00, 'published', true, '', false, now() - interval '3 minutes'
  ),
  (
    'boobie-ike-official-clip',
    'Boobie Ike: Official Character Clip',
    'Rockstar’s official Boobie Ike character clip. Is this already one of GTA VI’s most memorable personalities?',
    'https://www.rockstargames.com/VI/_next/static/media/Boobie_Ike_Video_Clip.0yf7eprhr68rj.mp4',
    'https://www.rockstargames.com/VI/_next/static/media/Boobie_Ike_Video_Clip.06_gu6y13hufm.jpg',
    'official-rockstar', 'https://www.rockstargames.com/VI/media/videos', 'Rockstar Games', date '2025-05-03',
    'external', 1.00, 'published', true, '', false, now() - interval '4 minutes'
  ),
  (
    'drequan-priest-official-clip',
    'Dre’Quan Priest: Official Character Clip',
    'Rockstar’s official Dre’Quan Priest character clip. What role do you expect him to play in Leonida?',
    'https://www.rockstargames.com/VI/_next/static/media/DreQuan_Priest_Video_Clip.0g~ify.ccqpkj.mp4',
    'https://www.rockstargames.com/VI/_next/static/media/DreQuan_Priest_Video_Clip.0p5nv9luhe2va.jpg',
    'official-rockstar', 'https://www.rockstargames.com/VI/media/videos', 'Rockstar Games', date '2025-05-03',
    'external', 1.00, 'published', true, '', false, now() - interval '5 minutes'
  ),
  (
    'real-dimez-official-clip',
    'Real Dimez: Official Character Clip',
    'Rockstar’s official Real Dimez clip. What kind of missions or music-world storylines could follow them?',
    'https://www.rockstargames.com/VI/_next/static/media/Real_Dimez_Video_Clip.0.cgr_26mspvm.mp4',
    'https://www.rockstargames.com/VI/_next/static/media/Real_Dimez_Video_Clip.05f8p4_2sk82a.jpg',
    'official-rockstar', 'https://www.rockstargames.com/VI/media/videos', 'Rockstar Games', date '2025-05-03',
    'external', 1.00, 'published', true, '', false, now() - interval '6 minutes'
  ),
  (
    'raul-bautista-official-clip',
    'Raul Bautista: Official Character Clip',
    'Rockstar’s official Raul Bautista character clip. Does Raul look like an ally, a threat, or both?',
    'https://www.rockstargames.com/VI/_next/static/media/Raul_Bautista_Video_Clip.0vg4g-gyqaksg.mp4',
    'https://www.rockstargames.com/VI/_next/static/media/Raul_Bautista_Video_Clip.07g3eeo2bgg2k.jpg',
    'official-rockstar', 'https://www.rockstargames.com/VI/media/videos', 'Rockstar Games', date '2025-05-03',
    'external', 1.50, 'published', true, '', false, now() - interval '7 minutes'
  ),
  (
    'brian-heder-official-clip',
    'Brian Heder: Official Character Clip',
    'Rockstar’s official Brian Heder character clip. What is your first impression of Brian?',
    'https://www.rockstargames.com/VI/_next/static/media/Brian_Heder_Video_Clip.0yy.ets6sso8~.mp4',
    'https://www.rockstargames.com/VI/_next/static/media/Brian_Heder_Video_Clip.0wbjj2r2i_2~c.jpg',
    'official-rockstar', 'https://www.rockstargames.com/VI/media/videos', 'Rockstar Games', date '2025-05-03',
    'external', 1.00, 'published', true, '', false, now() - interval '8 minutes'
  )
on conflict (slug) do nothing;

do $$
declare
  clip_row public.clips%rowtype;
  clips_category_id uuid;
  new_thread_id uuid;
  fallback_admin_id uuid;
begin
  select id into clips_category_id from public.categories where slug = 'clips-compilations';
  select id into fallback_admin_id from public.profiles where is_admin order by created_at limit 1;

  if clips_category_id is null then
    raise exception 'Clips & Compilations category is missing';
  end if;

  for clip_row in
    select * from public.clips
    where status = 'published' and thread_id is null
    order by published_at
  loop
    insert into public.threads (category_id, author_id, title, body)
    values (
      clips_category_id,
      coalesce(clip_row.uploader_id, fallback_admin_id),
      clip_row.title,
      clip_row.description
        || E'\n\nSource label: ' || clip_row.source_type
        || E'\nCreator credit: ' || clip_row.creator_credit
        || E'\nOriginal source: ' || clip_row.source_url
        || E'\n\nWatch: https://vicecityforums.com/#clips/' || clip_row.slug
    )
    returning id into new_thread_id;

    update public.clips set thread_id = new_thread_id where id = clip_row.id;
  end loop;
end;
$$;
