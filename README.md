# Vice City Forums

A community-first GTA VI / Vice City discussion platform built to feel like entering the city rather than opening a conventional message board.

## Production

The operational source of truth is [`OPERATIONS.md`](./OPERATIONS.md). It records the canonical production host, Supabase project, auth/admin path, deployment workflow, security follow-ups, and current work order.

## Initial product areas

- City-wide discussion feed
- District and topic channels
- Events and community meetups
- Crews and member profiles
- Media, clips, discoveries, rumors, and guides
- Reputation, progression, badges, and collectibles
- Moderation and community safety tools

## Local development

This first commit is a dependency-free front-end foundation.

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`.

Regenerate the static GTA 6 search hubs, sitemap, RSS feed, robots file, and manifest after editing their source content, then run the built-in quality gate:

```bash
node scripts/build-seo-pages.mjs
node scripts/validate-seo.mjs
```

## Project structure

```text
index.html
admin.html
gta-6-news/index.html
gta-6-release-date/index.html
gta-6-characters/index.html
gta-6-map-locations/index.html
gta-6-trailers/index.html
gta-6-funny-clips/index.html
gta-6-forums/index.html
gta-6-pre-order/index.html
gta-6-gameplay/index.html
gta-6-pc/index.html
gta-6-vehicles/index.html
gta-6-countdown/index.html
sitemap.xml
feed.xml
robots.txt
css/styles.css
css/content.css
js/app.js
js/backend-bootstrap.js
supabase/forum_growth_foundation.sql
GROWTH.md
OPERATIONS.md
```

## Brand

**Vice City Forums**  
Enter the city. Find your people.

This is an independent fan community and is not affiliated with Rockstar Games or Take-Two Interactive.
