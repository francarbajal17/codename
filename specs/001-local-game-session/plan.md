# Implementation Plan: Local Game Session

**Branch**: `001-local-game-session` | **Date**: 2026-06-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-local-game-session/spec.md`

## Summary

Build the initial CodeName application and local game-session MVP in the repository root. Bootstrap
a Next.js 16 App Router project with TypeScript strict mode, Tailwind CSS 4, ESLint, Prettier, npm,
and a `src/` layout. Implement deterministic, framework-independent game generation; persist each
complete game in Upstash Redis for 24 hours; expose separate public and leader projections; and
render the leader URL as a server-generated QR SVG so the token never enters public page props or
client JavaScript. Deliver responsive shared-board and mobile leader views, Vitest logic coverage,
targeted persistence integration tests, and Playwright smoke coverage for the primary browser flow.

## Technical Context

**Language/Version**: TypeScript 5.x in strict mode on Node.js 24 LTS

**Primary Dependencies**: Next.js 16.2.x, React 19, Tailwind CSS 4.x, shadcn/ui CLI and selected
components, `qrcode.react` 4.2.x, `@upstash/redis`; `@zxing/browser` for QR verification tests

**Storage**: One Upstash Redis JSON-compatible game record per `gameId`, written with a fixed
86,400-second TTL; no TTL refresh on reads

**Testing**: Vitest 4.x for unit and integration tests, `@vitest/coverage-v8`, and Playwright for the
critical create-board-scan-leader browser flow

**Target Platform**: Vercel-hosted Node.js runtime; current desktop and mobile browsers supported by
Next.js; shared laptop/desktop display plus phone portrait view

**Project Type**: Single Next.js App Router web application initialized in the repository root

**Performance Goals**: Timed acceptance journeys complete within 30 seconds for the host and 20
seconds for the leader; layouts satisfy the laptop and phone viewport ranges defined in the spec

**Constraints**: No authentication, accounts, WebSockets, realtime synchronization, permanent
history, Supabase, monorepo, or custom backend host; the token may exist only in the QR payload and
private URL, while public HTML/RSC application data, readable text, logs, and client bundles must not
contain readable tokens or assignments; all games expire exactly 24 hours after creation

**Scale/Scope**: MVP public deployment for independent casual groups; 25 cards per game; English and
Spanish built-in word lists; hundreds of simultaneous active games are sufficient for initial use

## Constitution Check

*GATE: Passed before research and re-checked after design.*

| Gate | Pre-Research | Post-Design Evidence |
|------|--------------|----------------------|
| MVP scope | Pass | One web app, one Redis record shape, no future multiplayer/account infrastructure |
| Information separation | Pass | Public projection strips assignments/token; QR SVG is the explicit bearer-link exception; leader route validates token before projection |
| Game isolation and lifetime | Pass | UUID `gameId`, Redis key scoped by ID, atomic write with 86,400-second TTL, no read extension |
| Game logic boundary | Pass | `src/lib/game/` has pure functions with injected randomness and no framework/storage imports |
| Frontend quality | Pass | Custom 5x5 board, responsive leader key, non-color labels, semantic controls, loading/error states |
| Deployment and security posture | Pass | Node runtime on Vercel, server-only env vars, 256-bit leader token, no login claims |
| Future restraint | Pass | Direct persistence functions and explicit projections; no repository framework, sockets, or speculative services |

No constitution violations require Complexity Tracking entries.

## Architecture

### Request and Data Flow

1. `POST` through the home-page Server Action accepts only `en` or `es`.
2. The action calls pure game generation with cryptographically secure randomness adapters, creates
   a UUID `gameId` and 256-bit base64url leader token, stores the complete `GameRecord` with TTL, and
   redirects only to `/games/{gameId}`.
3. The public Server Component loads the complete record server-side, immediately maps it through
   `toPublicGameView`, and passes only that projection to public UI components.
4. The board references `/games/{gameId}/leader-qr`, an SVG Route Handler containing no token in its
   URL. The handler loads the record server-side and uses `QRCodeSVG` with `renderToStaticMarkup` to
   encode `/games/{gameId}/leader/{token}`. The response is `image/svg+xml` with `no-store` headers.
5. The leader Server Component loads by `gameId`, validates the path token server-side, and only then
   maps through `toLeaderGameView`. Invalid, expired, or mismatched access returns the same friendly
   unavailable state without revealing whether the game exists.

### Persistence Boundary

Use a small concrete module, not a generic repository framework:

- `saveGame(record)` writes `codename:game:{gameId}` with `EX: 86400` in the same command.
- `loadGame(gameId)` returns a validated `GameRecord` or an unavailable result.
- `loadPublicGame(gameId)` composes `loadGame` with `toPublicGameView`.
- `loadLeaderGame(gameId, token)` validates access before returning `LeaderGameView`.

The Redis client and environment parser remain server-only. Runtime validation rejects malformed
stored records rather than passing partial state to views.

### Testing Strategy

- Unit tests cover word uniqueness, list selection, 25-card count, starting-team distribution,
  one-bomb invariant, validation failures, deterministic seeded/injected randomness, and projection
  redaction.
- Integration tests use a narrow fake Redis command surface or mocked `@upstash/redis` client to
  verify key scoping, atomic TTL writes, no TTL refresh, expired/missing behavior, and token checks.
- Playwright covers language selection, game creation, public-board secrecy, ZXing verification of
  the QR destination, valid leader rendering, invalid token handling, viewport ranges, and two-game
  isolation.
- A production build, lint, typecheck, unit tests, and selected browser tests are release gates.

## Project Setup Strategy

The repository is non-empty because Spec Kit and `AGENTS.md` already exist. `create-next-app` should
not overwrite these files. Bootstrap a temporary empty project using the official CLI, then merge
the generated application/configuration files into the repository root and delete only the temporary
directory. Preserve `.specify/`, `specs/`, `.agents/`, `.git/`, `AGENTS.md`, and project documentation.

Bootstrap options:

```bash
npx create-next-app@latest /tmp/codename-next-bootstrap \
  --typescript --eslint --tailwind --app --src-dir --import-alias '@/*' \
  --use-npm --empty --disable-git --no-agents-md
```

After merging, set the package name to `codename`, retain the generated lockfile, verify
`tsconfig.json` has `strict: true`, install runtime/testing/formatting packages, run shadcn init for
the existing project, and establish `dev`, `build`, `start`, `lint`, `typecheck`, `format`, `test`,
`test:coverage`, and `test:e2e` scripts. The first implementation milestone is a clean local startup
and passing empty-project quality commands before feature code is added.

## Project Structure

### Documentation (this feature)

```text
specs/001-local-game-session/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── environment.md
│   └── routes.md
└── tasks.md                 # Created later by /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── actions/
│   │   └── games.ts
│   ├── games/
│   │   └── [gameId]/
│   │       ├── leader/
│   │       │   └── [token]/page.tsx
│   │       ├── leader-qr/route.ts
│   │       ├── loading.tsx
│   │       └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── not-found.tsx
│   └── page.tsx
├── components/
│   ├── game/
│   │   ├── board-card.tsx
│   │   ├── game-board.tsx
│   │   ├── game-creator.tsx
│   │   ├── leader-key.tsx
│   │   ├── leader-qr.tsx
│   │   ├── starting-team.tsx
│   │   └── unavailable-game.tsx
│   └── ui/                  # Only selected shadcn/ui primitives
├── lib/
│   ├── config/
│   │   └── env.ts
│   ├── game/
│   │   ├── generate.ts
│   │   ├── projections.ts
│   │   ├── random.ts
│   │   ├── types.ts
│   │   ├── validate.ts
│   │   └── words/
│   │       ├── en.ts
│   │       └── es.ts
│   └── persistence/
│       ├── games.ts
│       └── redis.ts
└── styles/                  # Optional only if globals.css becomes insufficient

tests/
├── unit/
│   └── game/
├── integration/
│   └── persistence/
└── e2e/
    └── local-game-session.spec.ts
```

**Structure Decision**: Use one root Next.js application with `src/app`, colocated route files, pure
domain code under `src/lib/game`, and direct Upstash integration under `src/lib/persistence`. This is
the smallest structure that enforces public/private boundaries and keeps game rules independently
testable.

## Implementation Phases

### Phase A - Runnable Foundation

Bootstrap Next.js in the root without overwriting Spec Kit, install dependencies, initialize
shadcn/ui, add formatting and test configuration, validate environment parsing, and prove
`npm run dev`, lint, typecheck, tests, and build work before feature implementation.

### Phase B - Pure Game Domain

Define types, English and Spanish word lists, injected random helpers, game generation, invariants,
and public/leader projections. Complete required unit tests before wiring Next.js or Redis.

### Phase C - Temporary Persistence and Server Boundaries

Add server-only environment validation and Upstash access, persist complete game records atomically
with TTL, implement projection-specific load functions, and cover isolation, expiry, malformed data,
and token validation in integration tests.

### Phase D - Product Routes and UI

Implement home creation, public board, server-generated QR SVG, private leader route, responsive
custom board/key components, accessibility behavior, and friendly unavailable/retry states.

### Phase E - End-to-End and Deployment Readiness

Add Playwright coverage, inspect public HTML/RSC traffic for token/assignment leakage, validate
desktop and phone layouts, configure Vercel environment variables, and run the complete release
command set documented in `quickstart.md`.

## Complexity Tracking

No constitution violations or exceptional complexity are proposed.
