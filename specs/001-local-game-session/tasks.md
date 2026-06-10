---

description: "Dependency-ordered implementation tasks for the local game session MVP"
---

# Tasks: Local Game Session

**Input**: Design documents from `specs/001-local-game-session/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Game generation, validation, projection secrecy, persistence boundaries, leader access,
expiry, and cross-game isolation require automated coverage. Tests in each story phase are written
and observed failing before the corresponding implementation tasks.

**Organization**: Tasks are grouped by user story so each increment has an explicit independent
test and can be validated before continuing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it changes different files and has no dependency on another
  incomplete task in the same phase.
- **[Story]**: Maps the task to a user story from `spec.md`.
- Every task names the files it creates or changes.

## Phase 1: Setup (Runnable Project Foundation)

**Purpose**: Create a working Next.js application in the existing non-empty Spec Kit repository
before feature code is implemented.

- [ ] T001 Bootstrap a temporary Next.js 16 App Router project and merge its generated `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`, `public/`, and `src/app/` files into the repository root without replacing `.specify/`, `specs/`, `.agents/`, `AGENTS.md`, or `.git/`
- [ ] T002 Install `@upstash/redis` and `qrcode.react` runtime packages plus Vitest, V8 coverage, Playwright, Prettier, Tailwind sorting, and path-alias test tooling in `package.json` and `package-lock.json`
- [ ] T003 Initialize shadcn/ui for the `src/` alias layout and add only Button, Select, and Alert primitives in `components.json` and `src/components/ui/`
- [ ] T004 [P] Configure strict type checking, Node 24 engines, and `dev`, `build`, `start`, `lint`, `typecheck`, `format`, `format:write`, `test`, `test:watch`, `test:coverage`, and `test:e2e` scripts in `tsconfig.json` and `package.json`
- [ ] T005 [P] Configure Vitest path aliases and V8 coverage in `vitest.config.ts` and configure Playwright with the local Next.js web server in `playwright.config.ts`
- [ ] T006 [P] Configure Prettier and repository ignores in `prettier.config.mjs`, `.prettierignore`, and `.gitignore`
- [ ] T007 Verify the empty application starts and passes lint, typecheck, test, and production build commands defined in `package.json`, correcting only generated foundation files under `src/app/` and root configuration files

**Checkpoint**: `npm run dev`, `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`
all succeed before domain or product work begins.

---

## Phase 2: Foundational (Blocking Shared Boundaries)

**Purpose**: Establish shared types, configuration, server-only persistence access, and base visual
structure needed by every story.

**CRITICAL**: No user story work begins until this phase is complete.

- [ ] T008 Define `WordListLanguage`, `Team`, `CardAssignment`, `GameRecord`, public view, leader view, and unavailable result types in `src/lib/game/types.ts`
- [ ] T009 [P] Add curated English and Spanish word arrays with at least 25 unique non-empty entries each in `src/lib/game/words/en.ts` and `src/lib/game/words/es.ts`
- [ ] T010 [P] Add fixed board size, assignment counts, 86,400-second TTL, Redis key prefix, schema version, and token entropy constants in `src/lib/game/constants.ts`
- [ ] T011 Implement server-only validation for `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, and optional `APP_ORIGIN` in `src/lib/config/env.ts`
- [ ] T012 Create the server-only Upstash client using validated environment values in `src/lib/persistence/redis.ts`
- [ ] T013 [P] Add empty safe placeholders for local configuration in `.env.example` without committing credentials
- [ ] T014 [P] Establish global typography, focus visibility, responsive page containers, and accessible color tokens in `src/app/globals.css` and `src/app/layout.tsx`
- [ ] T015 Add test builders for valid game records, deterministic clocks, and fake persistence clients in `tests/helpers/game-fixtures.ts` and `tests/helpers/fake-redis.ts`

**Checkpoint**: Shared types and server boundaries compile without exposing environment variables or
secret-bearing records to Client Components.

---

## Phase 3: User Story 1 - Start a Shared Game (Priority: P1) MVP

**Goal**: A host selects English or Spanish, creates a temporary game without signing in, and sees
a readable public 5x5 board with the starting team and a token-free QR image reference.

**Independent Test**: From `/`, select either language and create a game. The resulting public URL
shows exactly 25 distinct words in a stable 5x5 layout, shows the starting team and QR image, and its
HTML/RSC data contains no token or card assignments.

### Tests for User Story 1

- [ ] T016 [P] [US1] Write failing unit tests for language-specific word selection, deterministic randomness, exactly 25 distinct cards, and stable positions in `tests/unit/game/generate.test.ts`
- [ ] T017 [P] [US1] Write failing unit tests for 9/8/7/1 assignment counts, starting-team balance, malformed records, and invalid word pools in `tests/unit/game/validate.test.ts`
- [ ] T018 [P] [US1] Write failing unit tests proving the public projection allowlists fields and excludes `leaderToken` and every assignment in `tests/unit/game/projections.test.ts`
- [ ] T019 [P] [US1] Write failing integration tests for atomic `EX: 86400` storage, Redis key construction, public loading, and no TTL refresh on reads in `tests/integration/persistence/public-games.test.ts`
- [ ] T020 [P] [US1] Write a failing Playwright test for language selection, game creation, 25 public words, starting-team display, QR image presence, and public-source secrecy in `tests/e2e/local-game-session.spec.ts`

### Implementation for User Story 1

- [ ] T021 [P] [US1] Implement injectable shuffle and random-choice helpers plus secure production adapters in `src/lib/game/random.ts`
- [ ] T022 [P] [US1] Implement UUID game IDs and 32-byte base64url leader-token generation in `src/lib/game/identity.ts`
- [ ] T023 [US1] Implement complete English/Spanish game generation with fixed positions and 9/8/7/1 assignments in `src/lib/game/generate.ts`
- [ ] T024 [US1] Implement full stored-record and invariant validation, including 24-hour timestamps and word-list membership, in `src/lib/game/validate.ts`
- [ ] T025 [US1] Implement allowlist-based `toPublicGameView` and `toLeaderGameView` transformations in `src/lib/game/projections.ts`
- [ ] T026 [US1] Implement `saveGame`, internal validated loading, and `loadPublicGame` with atomic TTL storage in `src/lib/persistence/games.ts`
- [ ] T027 [US1] Implement the validated English/Spanish creation Server Action with retryable failure state and redirect to the public URL in `src/app/actions/games.ts`
- [ ] T028 [P] [US1] Build the accessible language selector, submit state, and creation error UI in `src/components/game/game-creator.tsx`
- [ ] T029 [P] [US1] Build the secret-free public card and custom responsive 5x5 board components in `src/components/game/board-card.tsx` and `src/components/game/game-board.tsx`
- [ ] T030 [P] [US1] Build the public starting-team and QR image presentation components in `src/components/game/starting-team.tsx` and `src/components/game/leader-qr.tsx`
- [ ] T031 [US1] Replace the generated home page with the no-login creation experience in `src/app/page.tsx`
- [ ] T032 [US1] Implement the public game Server Component using only `PublicGameView` props in `src/app/games/[gameId]/page.tsx`
- [ ] T033 [US1] Implement the token-free public QR SVG Route Handler with server-side `QRCodeSVG` rendering and no-store headers in `src/app/games/[gameId]/leader-qr/route.ts`
- [ ] T034 [US1] Run and complete all US1 tests in `tests/unit/game/`, `tests/integration/persistence/public-games.test.ts`, and `tests/e2e/local-game-session.spec.ts`

**Checkpoint**: User Story 1 is independently demonstrable as a public shared board. The QR may
encode the future leader route, but the public page itself contains no leader token or assignment.

---

## Phase 4: User Story 2 - View the Private Leader Key (Priority: P2)

**Goal**: A leader scans the QR code and sees the matching 25-card secret key on a phone only after
the game-specific token is validated.

**Independent Test**: Open the QR destination for an active game and verify all words and positions
match the public board, assignments are labeled red/blue/neutral/bomb, and an altered token returns
no board data.

### Tests for User Story 2

- [ ] T035 [P] [US2] Write failing integration tests for valid leader loading, mismatched tokens, malformed tokens, missing games, and token-free returned projections in `tests/integration/persistence/leader-games.test.ts`
- [ ] T036 [P] [US2] Extend the Playwright flow to open the encoded leader destination, compare all 25 words and positions, verify category labels, and reject an altered token in `tests/e2e/local-game-session.spec.ts`

### Implementation for User Story 2

- [ ] T037 [US2] Implement server-side leader-token validation and `loadLeaderGame` without returning the stored token in `src/lib/persistence/games.ts`
- [ ] T038 [P] [US2] Build accessible leader cards and the responsive phone key with text/symbol cues in addition to color in `src/components/game/board-card.tsx` and `src/components/game/leader-key.tsx`
- [ ] T039 [US2] Implement the private leader Server Component that validates access before constructing leader props in `src/app/games/[gameId]/leader/[token]/page.tsx`
- [ ] T040 [US2] Add phone portrait assertions and keyboard/focus checks for the leader view in `tests/e2e/local-game-session.spec.ts`
- [ ] T041 [US2] Run and complete all US2 integration and browser tests in `tests/integration/persistence/leader-games.test.ts` and `tests/e2e/local-game-session.spec.ts`

**Checkpoint**: User Stories 1 and 2 provide the complete board-to-phone play setup while retaining
strict public/secret separation.

---

## Phase 5: User Story 3 - Return to an Active Game (Priority: P3)

**Goal**: Active URLs reopen the same game, while unknown, malformed, expired, and unauthorized URLs
show one friendly recoverable unavailable state without leaking data.

**Independent Test**: Reopen both URLs before expiry and see unchanged data; simulate the 24-hour
boundary and open invalid public and leader links to see the same helpful unavailable state with a
path back to `/`.

### Tests for User Story 3

- [ ] T042 [P] [US3] Write failing unit tests for active and expired timestamp boundaries without sliding expiry in `tests/unit/game/availability.test.ts`
- [ ] T043 [P] [US3] Write failing integration tests for missing, expired, malformed Redis records and unchanged TTL after repeated loads in `tests/integration/persistence/availability.test.ts`
- [ ] T044 [P] [US3] Extend Playwright coverage for refresh/revisit behavior, unknown game IDs, incomplete leader links, and friendly retry navigation in `tests/e2e/local-game-session.spec.ts`

### Implementation for User Story 3

- [ ] T045 [US3] Implement explicit active-versus-expired evaluation using `createdAt` and `expiresAt` in `src/lib/game/availability.ts`
- [ ] T046 [US3] Apply unavailable results uniformly to expired, missing, malformed, and unauthorized reads in `src/lib/persistence/games.ts`
- [ ] T047 [P] [US3] Build the shared friendly unavailable-game state with a start-new-game link in `src/components/game/unavailable-game.tsx`
- [ ] T048 [P] [US3] Add route-level loading states that expose no partial board or secret data in `src/app/games/[gameId]/loading.tsx` and `src/app/loading.tsx`
- [ ] T049 [US3] Integrate the common unavailable state into public and leader pages in `src/app/games/[gameId]/page.tsx` and `src/app/games/[gameId]/leader/[token]/page.tsx`
- [ ] T050 [US3] Run and complete all US3 unit, integration, and browser tests in `tests/unit/game/availability.test.ts`, `tests/integration/persistence/availability.test.ts`, and `tests/e2e/local-game-session.spec.ts`

**Checkpoint**: Active games are recoverable for exactly 24 hours and all unavailable cases are
safe, understandable, and consistent.

---

## Phase 6: User Story 4 - Keep Group Games Independent (Priority: P4)

**Goal**: Concurrent groups receive distinct public boards, private tokens, Redis records, QR
destinations, and leader keys that cannot cross-load.

**Independent Test**: Create two games in separate contexts, verify different IDs and tokens, and
prove every public/leader URL returns only its own game even under repeated and near-concurrent use.

### Tests for User Story 4

- [ ] T051 [P] [US4] Write failing integration tests for two-game key isolation, cross-token rejection, concurrent saves, and 100 generated ID/token pairs in `tests/integration/persistence/game-isolation.test.ts`
- [ ] T052 [P] [US4] Extend Playwright coverage to create two browser-context games and compare public boards, QR destinations, and private keys for zero cross-game exposure in `tests/e2e/local-game-session.spec.ts`

### Implementation for User Story 4

- [ ] T053 [US4] Enforce game-scoped Redis keys and reject loaded records whose embedded `gameId` differs from the requested key in `src/lib/persistence/games.ts`
- [ ] T054 [US4] Make creation use a fresh identity pair per request and prevent retries from reusing partial game state in `src/app/actions/games.ts`
- [ ] T055 [US4] Run and complete all US4 isolation tests in `tests/integration/persistence/game-isolation.test.ts` and `tests/e2e/local-game-session.spec.ts`

**Checkpoint**: Multiple groups can create and revisit games without any public or private data
crossing session boundaries.

---

## Phase 7: Polish and Cross-Cutting Release Gates

**Purpose**: Validate constitution-level secrecy, accessibility, operational setup, and deployment
readiness across the complete MVP.

- [ ] T056 [P] Add focused application metadata, localized page labels, and a default not-found experience in `src/app/layout.tsx` and `src/app/not-found.tsx`
- [ ] T057 [P] Add unit coverage for all validation error branches and maintain high coverage of pure game modules in `tests/unit/game/validate.test.ts` and `vitest.config.ts`
- [ ] T058 Audit public HTML, RSC requests, SVG metadata, logs, and browser bundles for known tokens and assignment data, encoding regression assertions in `tests/e2e/public-secrecy.spec.ts`
- [ ] T059 Validate shared-screen readability, increased text size, keyboard focus, reduced viewport height, and phone portrait behavior in `tests/e2e/accessibility-layout.spec.ts`
- [ ] T060 [P] Document local commands, environment setup, architecture boundaries, and Vercel deployment in `README.md` and keep `.env.example` synchronized with `specs/001-local-game-session/contracts/environment.md`
- [ ] T061 Configure Node 24 deployment expectations and verify no custom server or non-Vercel infrastructure is introduced in `package.json`, `next.config.ts`, and `README.md`
- [ ] T062 Run the full release gate of formatting, lint, typecheck, coverage, production build, and Playwright tests using scripts in `package.json`, resolving failures only in implementation and test files covered by this task list
- [ ] T063 Execute every clean-repository setup and manual product scenario in `specs/001-local-game-session/quickstart.md`, correcting stale instructions in that file and recording no secrets in committed files

---

## Dependencies and Execution Order

### Phase Dependencies

- **Phase 1 - Setup**: Starts immediately. T001-T003 are sequential; T004-T006 may run in parallel
  after dependencies exist; T007 closes the phase.
- **Phase 2 - Foundational**: Depends on Phase 1. T009, T010, T013, and T014 can proceed in parallel;
  T011 precedes T012; T008-T014 precede T015.
- **Phase 3 - US1**: Depends on Phase 2 and is the MVP implementation. T016-T020 are written first
  and must fail before T021-T033; T034 closes the story.
- **Phase 4 - US2**: Depends on the stored game, QR endpoint, and public board delivered by US1.
- **Phase 5 - US3**: Depends on US1 public loading and US2 leader loading so both routes receive the
  same expiry/error behavior.
- **Phase 6 - US4**: Depends on creation and both projections from US1-US3; it proves and hardens
  cross-game isolation rather than adding a new user-facing surface.
- **Phase 7 - Polish**: Depends on all selected user stories.

### User Story Dependency Graph

```text
Setup -> Foundation -> US1 (shared board MVP) -> US2 (leader key)
                                            -> US3 (recovery/expiry, after US2 loaders)
                                            -> US4 (isolation, after US2 and US3)
US1 + US2 + US3 + US4 -> Polish and release gates
```

### User Story Independence

- **US1**: Delivers a complete public board creation flow and can be demoed without a rendered leader
  page; its QR points to the defined private route contract.
- **US2**: Uses an existing US1 game and can be tested solely by opening one valid and one altered
  leader URL.
- **US3**: Uses existing URLs and can be tested with an injected clock/fake records without creating
  new product capabilities.
- **US4**: Uses two complete existing games and can be tested through cross-loading attempts without
  changing the single-game experience.

### Within Each User Story

1. Write the listed tests and confirm they fail for the intended missing behavior.
2. Implement pure types/rules before persistence orchestration.
3. Implement persistence before route/page integration.
4. Implement custom UI before story-level browser completion.
5. Run the story checkpoint before starting the next dependent story.

---

## Parallel Opportunities

### User Story 1

```text
T016 generate tests | T017 validation tests | T018 projection tests | T019 persistence tests | T020 browser test
T021 random helpers | T022 identity helpers
T028 creator UI | T029 public board UI | T030 starting-team/QR UI
```

### User Story 2

```text
T035 leader persistence tests | T036 leader browser test
T038 leader UI can proceed while T037 implements server loading
```

### User Story 3

```text
T042 boundary unit tests | T043 persistence expiry tests | T044 browser error-flow tests
T047 unavailable UI | T048 loading UI
```

### User Story 4

```text
T051 persistence isolation tests | T052 multi-context browser test
```

### Polish

```text
T056 metadata/not-found | T057 validation coverage | T060 documentation
```

---

## Implementation Strategy

### MVP First

1. Complete Setup and Foundational phases.
2. Complete US1 through T034.
3. Stop and validate that a host can create a secret-free shared board from both language lists.
4. Continue to US2 to make the in-person game fully playable with the private leader key.

### Incremental Delivery

1. **US1**: Public creation and board display.
2. **US2**: Private mobile leader key, completing the basic play setup.
3. **US3**: Revisit, expiry, and friendly unavailable behavior.
4. **US4**: Concurrent group isolation proof.
5. **Polish**: Security regression, accessibility/layout, documentation, and deployment gates.

### Scope Discipline

- Do not add authentication, accounts, lobby, chat, realtime state, score tracking, custom lists,
  permanent history, Supabase, a repository framework, or a custom backend host.
- Add a new abstraction only when a listed task demonstrates a present need for it.
- Treat token leakage, assignment leakage, missing TTL, cross-game reads, and untested generation
  invariants as release blockers.

## Notes

- `[P]` tasks touch different files and may run concurrently after their prerequisites.
- Story labels provide traceability to `spec.md` acceptance scenarios.
- Do not commit `.env.local`, Redis credentials, generated Playwright reports, coverage output, or
  private leader URLs.
- Commit after each task or coherent task group, keeping setup, domain, persistence, UI, and tests
  reviewable.
