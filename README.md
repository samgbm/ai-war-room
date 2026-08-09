# AI War Room

Realtime multiplayer ops command center built with **Next.js**, **Portal SDK**, and **next-themes** (11 themes). Operators collaborate on live channels while AI agents can be dispatched into the room.

## Stack

- Next.js App Router + TypeScript + Tailwind CSS
- `@portalsdk/core` + `@portalsdk/react` (channels, presence, typing)
- `next-themes` — 11 named palettes + Auto
- OpenAI (`gpt-4o-mini`) for agent replies via `/api/agents/run`

## Setup

```bash
npm install
cp .env.example .env.local
# fill NEXT_PUBLIC_PORTAL_KEY, PORTAL_SECRET, OPENAI_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

| Variable | Where | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_PORTAL_KEY` | Client | Publishable Portal key (`pk_…`) |
| `PORTAL_SECRET` | Server | Secret key (`sk_…`) — never expose to the browser |
| `OPENAI_API_KEY` | Server | Enables **Dispatch agent** |

## Deploy on Vercel

1. Push the repo and import the project in Vercel.
2. Add the three env vars above in Project Settings → Environment Variables.
3. Register your production origin with Portal (browsers on unregistered origins are blocked):

```bash
npx @portalsdk/cli origins add https://your-app.vercel.app --env <env-id>
```

4. Deploy. Health check: `GET /api/health`.

## Portal config

See `portal.config.ts` for `war-room-*` channel defaults (anonymous allowed for quick multiplayer demos).
