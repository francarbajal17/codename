# Quickstart: Local Game Session

This guide starts from the current repository state: Spec Kit scaffolding exists, but no Next.js
application or `package.json` exists yet.

## Prerequisites

- Node.js 24 LTS and npm 11+
- An Upstash Redis database
- Git
- Optional for deployment: a Vercel account and CLI

## 1. Bootstrap Next.js Without Overwriting Spec Kit

Generate a temporary current Next.js project:

```bash
npx create-next-app@latest /tmp/codename-next-bootstrap \
  --typescript --eslint --tailwind --app --src-dir --import-alias '@/*' \
  --use-npm --empty --disable-git --no-agents-md
```

Merge the generated application files into the repository root while preserving `.git/`, `.agents/`,
`.specify/`, `specs/`, `AGENTS.md`, and existing project documentation. Set `package.json` name to
`codename`. Do not initialize a second Git repository.

Verify `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

## 2. Install Runtime Dependencies

```bash
npm install @upstash/redis qrcode.react
```

Initialize shadcn/ui against the existing Next.js project:

```bash
npx shadcn@latest init
```

Add only the generic components selected during implementation, for example:

```bash
npx shadcn@latest add button select alert
```

## 3. Install Development Dependencies

```bash
npm install -D vitest @vitest/coverage-v8 vite-tsconfig-paths \
  @playwright/test prettier prettier-plugin-tailwindcss
npx playwright install
```

Expected package scripts:

```text
npm run dev            Start local development server
npm run build          Create production build
npm run start          Run production build
npm run lint           Run ESLint
npm run typecheck      Run TypeScript without emitting files
npm run format         Check formatting
npm run format:write   Apply formatting
npm test               Run Vitest once
npm run test:watch     Run Vitest in watch mode
npm run test:coverage  Run Vitest with coverage
npm run test:e2e       Run Playwright tests
```

## 4. Configure Environment

Create `.env.local` from the contract in [environment.md](./contracts/environment.md):

```dotenv
UPSTASH_REDIS_REST_URL=https://example.upstash.io
UPSTASH_REDIS_REST_TOKEN=replace-with-local-development-token
APP_ORIGIN=http://localhost:3000
```

Do not expose either Upstash value with a `NEXT_PUBLIC_` prefix.

## 5. Validate the Empty Application Foundation

Before feature code is added, these commands must pass:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run dev
```

Open `http://localhost:3000` and confirm the initial page loads.

## 6. Validate the Implemented Feature

Run static and automated checks:

```bash
npm run lint
npm run typecheck
npm run format
npm run test:coverage
npm run build
npm run test:e2e
```

Manual validation:

1. Open `/`, select English, and create a game.
2. Confirm the public page contains exactly 25 words in a 5x5 board and shows the starting team.
3. Confirm no card assignment, bomb marker, token text, or leader URL appears in page source or
   browser-loaded public data.
4. Scan the QR code and confirm the phone opens the matching leader key.
5. Confirm red, blue, neutral, and bomb cards use labels or symbols in addition to color.
6. Repeat with Spanish and confirm all words come from the Spanish list.
7. Create a second game and confirm URLs, boards, QR codes, and leader keys remain independent.
8. Alter the leader token and confirm the unavailable state contains no board data.
9. Open an unknown game ID and confirm the friendly unavailable state links back to `/`.
10. Test the leader view at a phone portrait viewport and the board on a typical laptop display.

See [routes.md](./contracts/routes.md) and [data-model.md](./data-model.md) for exact contracts and
invariants.

## 7. Vercel Deployment

1. Import the repository as a Vercel project with the root directory unchanged.
2. Select Node.js 24 and the standard Next.js build command.
3. Connect Upstash through the Vercel Marketplace or configure the required REST variables manually.
4. Set `APP_ORIGIN` to the production HTTPS URL.
5. Use separate Preview and Production Redis databases when practical.
6. Deploy and rerun the manual validation against the public URL on desktop and mobile.

The application requires no custom server, WebSocket service, authentication provider, migrations,
or permanent database.
