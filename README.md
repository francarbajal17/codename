# CodeName

CodeName is a public web app for local, in-person team word games. A shared laptop displays a 5x5
public board while team leaders scan a QR code to open the private assignment key on a phone.

## Stack

- Next.js 16 App Router, React 19, strict TypeScript
- Tailwind CSS 4 and selected shadcn/ui primitives
- Upstash Redis with a fixed 24-hour TTL
- Server-side `qrcode` SVG generation and ZXing browser verification
- Vitest and Playwright
- Vercel deployment with Node.js 24

## Local Development

Requirements: Node.js 24, npm 11+, and an Upstash Redis database.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Set these server-only values in `.env.local`:

```dotenv
UPSTASH_REDIS_REST_URL=https://example.upstash.io
UPSTASH_REDIS_REST_TOKEN=replace-with-a-real-token
APP_ORIGIN=http://localhost:3000
```

Open `http://localhost:3000`. Never prefix Redis credentials with `NEXT_PUBLIC_`.

## Commands

```bash
npm run dev
npm run format
npm run lint
npm run typecheck
npm test
npm run test:coverage
npm run test:e2e
npm run build
```

Playwright uses an explicit temporary file-backed persistence adapter only when
`E2E_USE_MEMORY_REDIS=1` is set by its local web-server configuration. Production always uses
Upstash Redis.

## Architecture Boundaries

- `src/lib/game`: pure generation, validation, availability, and projection logic.
- `src/lib/persistence`: server-only storage and access validation.
- Public pages receive `PublicGameView`, which has no token or assignments.
- The QR endpoint loads the bearer token server-side and emits only QR path geometry.
- Leader projections are created only after game ID, expiry, and token validation.
- There are no accounts, WebSockets, lobbies, chat, or permanent game history.

## Vercel

Import the repository root as a standard Next.js project. Use Node.js 24 and the default build
command. Configure all three variables above for Development, Preview, and Production; production
and preview `APP_ORIGIN` values must be their exact HTTPS origins. Separate Preview and Production
Redis databases are recommended.

No custom server, migration step, WebSocket service, or additional backend host is required.

The current specification and implementation plan live in
[`specs/001-local-game-session/`](specs/001-local-game-session/).
