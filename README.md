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

## Project structure

```text
index.html
admin.html
css/styles.css
js/app.js
js/backend-bootstrap.js
OPERATIONS.md
```

## Brand

**Vice City Forums**  
Enter the city. Find your people.

This is an independent fan community and is not affiliated with Rockstar Games or Take-Two Interactive.
