# Data Model: Local Game Session

## Overview

One complete `GameRecord` is persisted per game. Public and leader views are derived projections,
not separate mutable records. All card positions remain stable for the record's 24-hour lifetime.

## Enumerations

### WordListLanguage

```text
en | es
```

Only a supported built-in list may be selected. The value is immutable after creation.

### Team

```text
red | blue
```

### CardAssignment

```text
red | blue | neutral | bomb
```

### GameAvailability

```text
active | unavailable
```

`unavailable` covers missing, expired, malformed, and invalid-token cases at interface boundaries.

## Entities

### GameRecord

The complete server-only persisted form.

| Field | Type | Rules |
|-------|------|-------|
| `schemaVersion` | integer | Starts at `1`; required for stored-record validation |
| `gameId` | UUID string | Unique public identifier; immutable |
| `language` | `WordListLanguage` | Chosen before creation; immutable |
| `startingTeam` | `Team` | Randomly selected; same in both views |
| `cards` | `BoardCard[]` | Exactly 25, ordered by position |
| `leaderToken` | base64url string | 32 random bytes; server-only bearer secret |
| `createdAt` | ISO timestamp | UTC creation instant |
| `expiresAt` | ISO timestamp | Exactly 24 hours after `createdAt` |

**Relationships**:

- Owns exactly 25 `BoardCard` values.
- Produces exactly one `PublicGameView`.
- Produces one `LeaderGameView` only after token validation.
- Is stored under Redis key `codename:game:{gameId}`.

### BoardCard

| Field | Type | Rules |
|-------|------|-------|
| `position` | integer | Unique integer from 0 through 24 |
| `word` | string | Non-empty and unique within the game |
| `assignment` | `CardAssignment` | Exactly one assignment |

Position maps row-major onto a 5x5 board:

```text
row = floor(position / 5)
column = position % 5
```

### PublicBoardCard

| Field | Type | Rules |
|-------|------|-------|
| `position` | integer | Copied from the matching board card |
| `word` | string | Copied from the matching board card |

No assignment field is permitted.

### PublicGameView

| Field | Type | Rules |
|-------|------|-------|
| `gameId` | UUID string | Matches requested public game |
| `language` | `WordListLanguage` | Public and immutable |
| `startingTeam` | `Team` | Public game instruction |
| `cards` | `PublicBoardCard[]` | Exactly 25, stable order, no assignments |
| `expiresAt` | ISO timestamp | May support friendly expiry messaging |
| `qrImagePath` | string | `/games/{gameId}/leader-qr`; contains no token |

**Forbidden fields**: `leaderToken`, `assignment`, secret key collections, or leader URL.

### LeaderBoardCard

| Field | Type | Rules |
|-------|------|-------|
| `position` | integer | Copied from the matching board card |
| `word` | string | Copied from the matching board card |
| `assignment` | `CardAssignment` | Visible only after valid token comparison |

### LeaderGameView

| Field | Type | Rules |
|-------|------|-------|
| `gameId` | UUID string | Matches requested game |
| `language` | `WordListLanguage` | Same as public view |
| `startingTeam` | `Team` | Same as public view |
| `cards` | `LeaderBoardCard[]` | Exactly 25 with assignments |
| `expiresAt` | ISO timestamp | Same lifetime as public view |

The response does not need to return `leaderToken` after access is validated.

## Invariants

Every valid active `GameRecord` MUST satisfy all of the following:

1. There are exactly 25 cards and positions are the complete set 0-24.
2. All 25 words are distinct and belong to the selected language list.
3. `startingTeam` has exactly 9 assigned cards.
4. The other team has exactly 8 assigned cards.
5. Exactly 7 cards are neutral.
6. Exactly 1 card is the bomb.
7. `expiresAt - createdAt` is exactly 24 hours.
8. `gameId` is a valid UUID and `leaderToken` decodes to 32 bytes.
9. Public projection contains no token or assignment information.
10. Leader projection is created only after game ID and token both match an active record.

## Generation Inputs and Outputs

Pure generation accepts:

- `language`
- language-specific word list
- injected random integer/shuffle source
- generated `gameId`
- generated `leaderToken`
- creation timestamp

It returns a complete validated `GameRecord`. Next.js, Redis, environment variables, and browser
objects are not accepted by or imported into the generation module.

## Lifecycle

```text
requested
  -> generated and validated
  -> persisted with 86,400-second TTL
  -> active public/leader reads
  -> Redis expiry
  -> unavailable
```

- A failed generation or validation never creates a partial record.
- A failed persistence attempt returns creation failure and no public URL.
- Reads do not mutate the record or extend TTL.
- There is no manual update, score state, completion state, archival state, or history in the MVP.

## Validation Boundaries

- Creation input validates `language` before generation.
- Generated state validates all invariants before persistence.
- Loaded Redis data validates the complete record shape before projection.
- Public projection is allowlist-based rather than deleting secret fields from an object copy.
- Leader access validates the token before constructing any leader projection.
