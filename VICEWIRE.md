# ViceWire Operator

ViceWire is the AI operating layer for Vice City Forums. It is designed to run the repetitive parts of the community while keeping destructive or high-impact actions under owner control.

## V1 capabilities

- Reviews new threads and replies from a queued event stream.
- Uses OpenAI moderation before generating an operator decision.
- Can propose a helpful reply, flag content, recommend a lock, or do nothing.
- Can automatically publish low-risk replies when `auto_reply` is enabled.
- Can create a clearly labeled daily discussion thread when `auto_post` is enabled.
- Keeps an audit record in `vicewire_actions` with a short decision summary.
- Gives admins a command center at `/vicewire.html`.
- Permanent bans, deletions, rule changes, financial actions, and legal actions are not automated in V1.

## Architecture

```text
Forum post / reply
      ↓
Supabase trigger
      ↓
vicewire_jobs queue
      ↓
GitHub Actions hourly worker
      ↓
OpenAI moderation + Responses API
      ↓
vicewire_actions audit log
      ↓
Low-risk auto action OR owner approval
```

The existing forum remains a static GitHub Pages site. The worker runs server-side inside GitHub Actions so no OpenAI or Supabase service-role secret is ever placed in browser JavaScript.

## 1. Apply the Supabase SQL

Use the Supabase project currently referenced by `js/app.js`.

Run, in order:

1. `supabase/vicewire.sql`
2. `supabase/vicewire_approvals.sql`

The first migration creates the queue, settings, admin list, audit log, RLS policies, and automatic enqueue triggers. The second adds owner approval/rejection RPCs.

## 2. Make the owner account a ViceWire admin

First create/sign in to the normal Vice City Forums account you want to use as the owner. Then in Supabase SQL Editor find its auth user ID:

```sql
select id, email, created_at
from auth.users
order by created_at desc;
```

Add that UUID to the admin list:

```sql
insert into public.vicewire_admins (user_id)
values ('PASTE-AUTH-USER-UUID-HERE')
on conflict do nothing;
```

Do not put an owner email, password, service-role key, or OpenAI key in this repository.

## 3. Add GitHub Actions secrets

Repository settings → Secrets and variables → Actions → New repository secret.

Required secrets:

- `VICEWIRE_SUPABASE_URL` — the Supabase project URL used by the live forum.
- `VICEWIRE_SUPABASE_SERVICE_ROLE_KEY` — server-side service role key. Never expose this in the site JavaScript.
- `OPENAI_API_KEY` — OpenAI API key used by the worker.

Optional repository variable:

- `VICEWIRE_OPENAI_MODEL` — defaults to `gpt-5.6-luna` for cost-sensitive, high-volume operation.

## 4. Open the command center

After the SQL is applied and the owner UUID is in `vicewire_admins`, open:

```text
https://vicecityforums.com/vicewire.html
```

(or the equivalent GitHub Pages URL before the custom domain is attached).

Sign in with the owner forum account. RLS prevents non-admin accounts from reading or changing ViceWire controls.

## 5. Enable deliberately

Recommended first-run settings:

- ViceWire enabled: **ON**
- Automated safety review: **ON**
- Automatic replies: **OFF**
- Daily discussion post: **OFF**

Run the workflow manually once and inspect `NEEDS OWNER DECISION` and `RECENT VICEWIRE ACTIVITY`. Then enable automatic replies and daily posts after the output quality is verified.

## Public identity

AI-generated forum content uses the public label `VICEWIRE AI`. The forum replaces the legacy demo badge on those rows with an `AI` badge so members can distinguish AI-operated posts from human posts.

## Safety boundary

ViceWire V1 may analyze, propose, flag, reply, and create low-risk community prompts. It does **not** autonomously ban users, delete significant content, alter site rules, impersonate humans, or claim official GTA/Rockstar affiliation.
