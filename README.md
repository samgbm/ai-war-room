# AI War Room

A realtime multiplayer ops surface where human operators and an AI agent share one Portal channel: live chat, typing indicators, presence, cursors, streaming agent replies, inbox mentions, connection resilience, and a channel extension that exposes agent status to late joiners.

```
┌───────────────────────────── Browser (Vercel / Next.js) ─────────────────────────────┐
│  PortalProvider → WarRoomChannelProvider (useChannel)                                 │
│  ChatRoom · LiveCursors · PresenceRoster · NotificationBell (useInbox)                │
│  ConnectionBanner · ThemeSwitcher · Agent Status Bar (ext.agentState)                 │
└──────────────────────────────────────────┬────────────────────────────────────────────┘
                                           │ WebSocket (Portal realtime)
                                           ▼
┌───────────────────────────── Portal edge ────────────────────────────────────────────┐
│  Channel: war-room-alpha  ·  history · presence · inbox notify · agentState extension │
└──────────────────────────────────────────┬────────────────────────────────────────────┘
                                           │ same channel (SDK worker)
                                           ▼
┌───────────────────────────── Backend (Railway / Express) ────────────────────────────┐
│  startAgentLoop() → @Agent mentions → OpenAI stream → durable stream + final reply    │
│  portal.config.ts (notify bridge + AgentState extension)                              │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

## Stack

| Layer | Tech |
| --- | --- |
| Frontend | Next.js 16.3, React 19, Tailwind CSS v4, TypeScript |
| Realtime | `@portalsdk/core` + `@portalsdk/react` |
| Themes | `next-themes` — 12 palettes + Auto (incl. **Mura**) |
| AI worker | Node.js Express, `tsx`, OpenAI `gpt-4o-mini` streaming |
| Portal config | `@portalsdk/config` + `@portalsdk/extension-protocol` |
| Deploy | Frontend → Vercel · Backend → Railway |

## Features

- **Shared mission channel** (`war-room-alpha`) with history backfill (`history: 50`)
- **Multiplayer chat** with typing indicators and presence roster
- **Live cursors** via presence metadata (see [Portal realtime](#how-we-use-portal-realtime))
- **`@Agent` AI replies** streamed into the room from a backend worker
- **Agent status bar** fed by a Portal **channel extension** snapshot (`Processing prompt…` / `Standing by`)
- **Inbox notifications** when the agent tags the human in the final reply (`notify` bridge)
- **Connection banner** driven by Portal channel status (`reconnecting`, `degraded`, `blocked`, …)
- **12 visual themes** including Command, Midnight, Arctic, and Mura (Happy Hues)

---

## How we use Portal realtime

Portal is the fan-out fabric for the war room. Both the Next.js clients and the Node agent worker join the **same channel** as first-class participants. There is no custom WebSocket server in this repo for chat/presence — Portal owns ordering, delivery, presence, inbox, and extension snapshots.

### 1. Client bootstrap

```tsx
// PortalProviderWrapper — one Portal client for the app
const portal = new Portal({ apiKey: process.env.NEXT_PUBLIC_PORTAL_KEY });

<PortalProvider client={portal}>{children}</PortalProvider>
```

Anonymous mode is enabled on `war-room-*` so demos can join without a custom JWT issuer. Portal mints anon credentials via the publishable key.

### 2. Shared channel handle

Every realtime UI surface must use the **same** channel id and options:

```ts
// src/lib/war-room.ts
export const WAR_ROOM_ID = "war-room-alpha";
export const WAR_ROOM_CHANNEL = { channelId: WAR_ROOM_ID, history: 50 };
```

`WarRoomChannelProvider` wraps `useChannel` once and exposes messages, `send`, presence, typing, and cursor helpers to children (chat, roster, cursors).

### 3. Messages & history

- Operators publish `{ content: { text } }` through `channel.send`.
- `history: 50` backfills recent durable messages on connect so late joiners see context.
- Message types we use:
  - default chat messages
  - `agent-stream` — durable stream flushes (assembled text) while the model generates
  - `agent.status` — routed into the `agent.` extension namespace
  - (legacy) `cursor` — no longer flooded as durable publishes

### 4. Presence & typing

- `sendTyping()` / `typing` for “X is typing…”
- `setMetadata({ cursor })` for live cursor positions
- `presence` (detailed roster) powers **PresenceRoster** and cursor sync for remotes

### 5. Why we avoid ephemeral for critical UX

Portal’s JS client currently **drops inbound ephemeral frames** (they are not ingested into the message stream). Docs still recommend ephemeral for high-frequency signals, but for this app:

| Concern | Approach |
| --- | --- |
| Agent token stream | Durable `type: "agent-stream"` flushes (~50ms) with full assembled `text` |
| Live cursors | Presence `setMetadata({ cursor })` instead of flooding durable cursor messages |
| Agent status | Channel **extension** snapshot + broadcasts under `agent.` namespace |

Ephemeral sends are still attempted for stream chunks / status in some paths, but the UI does not depend on them arriving.

### 6. AI agent as a channel participant

The Railway backend creates its own Portal client and joins `war-room-alpha`:

1. Listens for durable messages matching `/@agent\b/i`
2. Sets typing activity + extension status → `Processing prompt...`
3. Streams OpenAI tokens; periodically flushes `agent-stream` updates
4. Sends the final plain-text reply with  
   `mentions: [{ userId: msg.sender.id }]`
5. Resets status → `Standing by`

Plain-text post-processing strips Markdown (`**bold**`, headings, etc.) so ops chat stays readable.

### 7. Channel extension: `agentState`

```ts
// backend/extensions/agentState.ts
static manifest = { namespace: "agent.", transport: "ws" };
```

- `onBatch` — on `agent.status`, updates in-memory status and returns `{ snapshotDirty: true, broadcasts }`
- `onSnapshot` — returns `{ status }` for **late joiners** on the connect frame

Frontend:

```ts
const { ext, status } = useChannel({ ...WAR_ROOM_CHANNEL, channelId: roomId });
const agentSnapshot = ext?.["agentState"] as { status: string } | undefined;
```

Late joiners see “Processing prompt…” immediately when the agent is mid-flight — no Postgres round-trip.

Deploy extensions with the backend config:

```bash
cd backend && npm run portal:deploy
```

### 8. Inbox + notify bridge

`backend/portal.config.ts`:

```ts
notify: (ctx) => {
  const mentions = ctx.message.mentions ?? [];
  if (mentions.length === 0) return null;
  return {
    title: "Agent Tagged You",
    data: { text: ctx.message.content.text },
    to: mentions.map((m) => m.userId),
  };
};
```

When the agent’s final message mentions the human, Portal creates an inbox item. The UI uses:

```ts
const { counter, items, markAllRead } = useInbox();
```

`NotificationBell` shows a global unread badge and snippets (`title: text…`).  
`useInbox` is a lazy singleton — it aggregates notifications across channels for the connected identity.

> **Note:** Stable cross-session inbox identity needs a real signed user JWT. Anonymous sessions work for live demos but identity resets when Portal remints anon credentials. A plain string like `"demo-human-operator"` is **not** a JWT and will cause publish rejections.

### 9. Connection resilience

`useChannel` exposes granular `status` values. `ConnectionBanner` renders for:

| Status | Banner |
| --- | --- |
| `ready` | Hidden |
| `reconnecting` | Amber — reestablishing link |
| `degraded` / `degraded-http` | Yellow — HTTP fallback / higher latency |
| `blocked` | Red — credentials / rate limit |

We trust Portal’s WebSocket heartbeat instead of `window.offline` events.

### 10. Payload discipline (≤2KB)

Portal caps WebSocket content payloads. Binary audio was intentionally removed; any future media should use a **URL-trigger** pattern (small id over Portal, bytes over HTTP), not Base64 on the wire.

---

## Repository layout

```
ai-war-room/
├── src/
│   ├── app/                    # Next.js App Router
│   ├── components/
│   │   ├── ChatRoom.tsx
│   │   ├── WarRoomChannelProvider.tsx
│   │   ├── LiveCursors.tsx
│   │   ├── PresenceRoster.tsx
│   │   ├── NotificationBell.tsx
│   │   ├── ConnectionBanner.tsx
│   │   ├── theme-switcher.tsx
│   │   └── PortalProviderWrapper.tsx
│   └── lib/
│       ├── war-room.ts         # Shared channel id + options
│       └── themes.ts
├── backend/
│   ├── portal.config.ts        # anonymous, notify, extensions
│   ├── extensions/agentState.ts
│   └── src/
│       ├── index.ts            # Express + agent loop
│       ├── portalClient.ts
│       └── ai/
│           ├── agentLoop.ts
│           └── openaiClient.ts
└── README.md
```

## Local setup

### Frontend

```bash
npm install
cp .env.example .env.local
# NEXT_PUBLIC_PORTAL_KEY=pk_...
# PORTAL_SECRET=sk_...          # server-only if needed
# OPENAI_API_KEY=sk-...         # optional for /api/agents/run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Backend agent worker

```bash
cd backend
npm install
cp .env.example .env
# NEXT_PUBLIC_PORTAL_KEY / PORTAL_SECRET must match the frontend project
# OPENAI_API_KEY=...
npm run portal:deploy   # push notify + agentState extension
npm run dev             # http://localhost:8080  ·  GET /api/health
```

Keep **both** processes running for `@Agent` replies.

### Environment

| Variable | App | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_PORTAL_KEY` | Frontend + backend | Publishable Portal key (`pk_…`) |
| `PORTAL_SECRET` | Backend (deploy / CLI) | Secret key (`sk_…`) — never ship to the browser |
| `OPENAI_API_KEY` | Backend (and optional Next route) | Agent completions |
| `PORT` | Backend | Defaults to `8080` (Railway injects its own) |

## Demo flows

**Multiplayer chat**  
Open two browsers → same room → type; see presence, typing, and cursors.

**AI agent**  
Send `@Agent write a short status update` → status bar flips to *Processing prompt…* → stream bubble grows → final durable message lands.

**Late-joiner status**  
Start a long `@Agent` prompt in window A → open incognito window B → status bar should show *Processing prompt…* from the extension snapshot.

**Inbox**  
Trigger `@Agent …` → agent final reply mentions you → (with a stable identity) NotificationBell badge increments.

**Resilience**  
Throttle/offline the network → ConnectionBanner tracks Portal `reconnecting` / degraded states.

## Tests

```bash
# Frontend
npm test

# Backend
cd backend && npm test
```

Vitest + Testing Library cover ChatRoom streaming, NotificationBell, ConnectionBanner, agent loop, notify bridge, and the `agentState` extension.

## Deploy

### Frontend (Vercel)

1. Import the repo; set root to the Next app (repo root).
2. Add `NEXT_PUBLIC_PORTAL_KEY` (and any server keys you still use).
3. Allow the production origin in Portal:

```bash
npx @portalsdk/cli origins add https://your-app.vercel.app --env <env-id>
```

### Backend (Railway)

1. Root directory: `backend`
2. Start: `npm start` (`tsx src/index.ts`)
3. Set Portal + OpenAI env vars
4. Run `npm run portal:deploy` whenever `portal.config.ts` or extensions change

## Themes

Select from the header theme switcher. Palettes live in `src/app/globals.css` as CSS variables (`--background`, `--primary`, …) and are registered in `src/lib/themes.ts`.

Includes **Mura** — Happy Hues cream / pink / navy stroke inspired by [mohanadkandil/Mura](https://github.com/mohanadkandil/Mura).

## License

Private / course project unless otherwise noted.
