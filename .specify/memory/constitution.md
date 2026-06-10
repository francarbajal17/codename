<!--
Sync Impact Report
- Version change: 1.0.0 -> 1.0.1
- Modified principles:
  - II. Public and Secret Information Separation: clarified the intentional QR bearer-link exception
- Added sections: none
- Removed sections: none
- Templates:
  - ✅ updated: .specify/templates/plan-template.md
  - ✅ updated: .specify/templates/spec-template.md
  - ✅ updated: .specify/templates/tasks-template.md
  - ✅ reviewed, no changes required: .specify/templates/checklist-template.md
  - ✅ reviewed, no changes required:
    .specify/extensions/agent-context/commands/speckit.agent-context.update.md
- Runtime guidance:
  - ✅ reviewed, no changes required: AGENTS.md
  - ✅ reviewed, no changes required: README.md
- Follow-up TODOs: none
-->
# CodeName Constitution

## Core Principles

### I. MVP Simplicity First
Implementation MUST favor the simplest explicit solution that satisfies observable MVP behavior.
New infrastructure, patterns, services, and abstractions MUST solve a demonstrated current problem.
Every proposal that adds complexity MUST identify that problem and explain why a simpler approach is
insufficient. Matchmaking, chat, a global lobby, user accounts, advanced permissions, and complex
remote multiplayer synchronization are outside the MVP. This keeps the first release maintainable
and focused on the in-person shared-board experience.

### II. Public and Secret Information Separation
The shared main screen MUST display only public game information. The secret leader key MUST be
available only through a private leader view whose URL contains a sufficiently unpredictable access
token. The shared screen MAY expose that private URL only as the payload of the visible QR code,
because scanning the code is the intended casual in-room access mechanism. The token and card
assignments MUST NOT otherwise appear as readable text, public component props, serialized public
application data, logs, or client bundles. Server endpoints and persistence access MUST return the
minimum data required by each view. This separation prevents accidental disclosure while preserving
the same player-responsibility model as the physical game.

### III. Independent and Temporary Games
Every game MUST have a unique `gameId`, and all reads and writes MUST be scoped to that identifier.
Game state MUST be stored in Upstash Redis with an explicit TTL and MUST expire automatically. The
MVP MUST NOT depend on permanent persistence, game history, or critical state held only in a server
process's memory. Expired or unknown games MUST produce a clear recoverable user outcome. These
rules allow unrelated groups to use the public deployment without sharing or retaining game state.

### IV. Isolated and Testable Game Logic
Word selection, team assignment, starting-team balance, bomb assignment, neutral-card assignment,
and state validation MUST live in pure TypeScript functions or modules independent of React,
Next.js, Redis, and browser APIs. Game generation and validation behavior MUST have automated tests
covering invariants, boundaries, and invalid states. UI and persistence layers MAY orchestrate this
logic but MUST NOT duplicate or redefine its rules. Isolation keeps the core game deterministic,
reviewable, and testable without framework infrastructure.

### V. Clear, Accessible, Polished Frontend
The interface MUST be minimal, responsive, and usable on both a shared computer screen and mobile
leader devices. The 5x5 board and its 25 words MUST remain readable from a reasonable in-room
viewing distance, with state conveyed through accessible contrast and more than color alone where
needed. Keyboard access, visible focus, semantic controls, and useful loading and error states MUST
be included for interactive flows. shadcn/ui MAY supply generic base components, while the board and
primary game experience MUST be custom-designed for CodeName rather than assembled as a generic
dashboard.

### VI. Public Deployment Without Initial Authentication
The application MUST deploy to Vercel without requiring login. Leader access MUST use an
unpredictable token carried in a private URL and validated server-side. The product MUST describe
this as protection suitable for a casual in-person game, not as enterprise-grade authentication or
authorization. User accounts, advanced permissions, and authentication infrastructure MUST NOT be
added during the MVP unless this constitution is amended. This preserves low-friction play while
setting honest security expectations.

### VII. Prepared for Future Evolution
Module boundaries and data contracts MUST permit later addition of authentication, game history,
custom word lists, online mode, WebSockets, or relational persistence. Those future capabilities
MUST NOT be implemented, preconfigured, or allowed to dominate current designs before a concrete
requirement exists. Replaceable boundaries are preferred where they are already natural, but
speculative interfaces and generalized frameworks are prohibited. This balances future change with
the obligation to deliver a small MVP now.

## Technical Constraints

- The application MUST use Next.js with the App Router, TypeScript, and Tailwind CSS.
- TypeScript strict mode MUST be enabled where supported; exceptions MUST be narrow and documented.
- shadcn/ui MUST be used selectively for generic primitives, not as a substitute for product-specific
  board design.
- QR codes MUST be generated with `qrcode.react` and MAY encode the private leader URL as their
  payload, but the token MUST NOT be rendered as readable text or exposed in public application data.
- Temporary game persistence MUST use Upstash Redis with TTL. Supabase MUST NOT be introduced in the
  MVP unless a documented future architecture decision replaces Redis.
- Critical game state MUST NOT exist only in server memory.
- Card assignments and readable access tokens MUST NOT be exposed through public application data,
  public component props, logs, or client bundles. The QR payload is the sole public-route exception.
- WebSockets or other realtime infrastructure MUST NOT be added until observable product behavior
  requires it.
- The deployment target MUST remain Vercel-compatible.

## Development Workflow and Quality Gates

1. A feature specification MUST define observable behavior, explicit scope exclusions, edge cases,
   and independently verifiable acceptance criteria before implementation planning begins.
2. Plans MUST pass a Constitution Check before research and again after design. The check MUST cover
   MVP scope, public/secret data flow, game isolation and TTL, pure logic boundaries, accessibility,
   Vercel compatibility, and any introduced complexity.
3. Tasks MUST trace to acceptance criteria. Tasks affecting game generation or validation MUST
   include automated tests and MUST keep the logic independent from UI and persistence.
4. Reviews MUST treat secret exposure, cross-game state access, missing TTL, and untested game
   invariants as release-blocking defects.
5. Architecture changes MUST cite the principle they affect and justify the real current problem
   solved. Future possibilities alone are not sufficient justification.
6. Delivered features MUST be validated on the shared-screen board and the mobile leader view when
   either surface is affected.

## Governance

This constitution takes precedence over ad hoc development decisions, feature plans, and local
conventions. Every specification, implementation plan, task list, and code review MUST verify
compliance. Any exception MUST be documented in the plan's Complexity Tracking section with the
affected principle, necessity, rejected simpler alternative, and a removal or review condition.

Amendments require a written proposal describing the change, rationale, affected artifacts, and any
migration work. The amendment MUST update this file and all dependent templates in the same change.
Versioning follows semantic versioning: MAJOR for removing or redefining a core principle in a
backward-incompatible way, MINOR for adding a principle or materially expanding governance, and
PATCH for clarifications without semantic change. Compliance MUST be reviewed whenever a feature is
specified, planned, and approved for release.

**Version**: 1.0.1 | **Ratified**: 2026-06-10 | **Last Amended**: 2026-06-10
