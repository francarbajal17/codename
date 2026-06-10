# Route and Server Interaction Contracts

## General Rules

- All dynamic game responses are non-cacheable unless a future review proves caching preserves
  expiry and secrecy guarantees.
- Missing, expired, malformed, and unauthorized leader requests use a common unavailable-game UI.
- Public application data never contains readable `leaderToken`, leader URL text, or card assignments.
  The QR SVG payload is the intentional bearer-link exception.
- Route parameters are treated as untrusted input.

## Home Page

### `GET /`

**Purpose**: Display the game creation form.

**Public content**:

- Product title and brief in-person instructions
- English/Spanish language selector
- Start-game submit control

**States**:

- Ready
- Submitting
- Creation failed with retry control

## Create Game Server Action

### `createGame(formData)`

**Input contract**:

```json
{
  "language": "en | es"
}
```

**Success behavior**:

1. Generate and validate a complete game.
2. Persist it with a 24-hour TTL.
3. Redirect to `/games/{gameId}`.

The action MUST NOT return the leader token to the form component or redirect URL.

**Failure behavior**:

- Unsupported/missing language: return a field-level creation error; do not persist.
- Generation/validation failure: return a generic retryable creation error; do not persist.
- Persistence failure: return a generic retryable creation error; do not expose partial game data.

## Public Game Page

### `GET /games/{gameId}`

**Success data contract**:

```json
{
  "gameId": "uuid",
  "language": "en | es",
  "startingTeam": "red | blue",
  "cards": [
    { "position": 0, "word": "example" }
  ],
  "expiresAt": "ISO-8601 timestamp",
  "qrImagePath": "/games/{gameId}/leader-qr"
}
```

`cards` has exactly 25 entries. No entry contains an assignment.

**Unavailable behavior**:

- Show the shared unavailable-game component with a link to `/`.
- Do not distinguish missing, expired, or malformed stored data to the user.

## Leader QR Image

### `GET /games/{gameId}/leader-qr`

**Purpose**: Return an SVG QR code encoding the private leader URL without serializing the token into
the public page or client bundle.

**Success response**:

- Status: `200`
- Content-Type: `image/svg+xml; charset=utf-8`
- Cache-Control: `private, no-store, max-age=0`
- Body: SVG generated from `/games/{gameId}/leader/{leaderToken}`
- Accessible SVG title: localized instruction to scan for the leader key

**Failure response**:

- Status: `404`
- Cache-Control: `private, no-store, max-age=0`
- No token, board, or assignment content

The route URL itself contains only `gameId`. The SVG must not include the destination as visible text,
metadata, comments, or attributes beyond encoded module path data.

## Private Leader Page

### `GET /games/{gameId}/leader/{token}`

**Validation order**:

1. Validate route parameter shapes.
2. Load and validate the active record by `gameId`.
3. Compare the supplied token with the stored token.
4. Construct `LeaderGameView` only after success.

**Success data contract**:

```json
{
  "gameId": "uuid",
  "language": "en | es",
  "startingTeam": "red | blue",
  "cards": [
    {
      "position": 0,
      "word": "example",
      "assignment": "red | blue | neutral | bomb"
    }
  ],
  "expiresAt": "ISO-8601 timestamp"
}
```

`cards` has exactly 25 entries and matches the public board positions and words.

**Unavailable behavior**:

- Missing game, expired game, malformed record, malformed token, and mismatched token render the same
  unavailable-game component.
- No partial board, existence hint, or assignment data is rendered.

## Persistence Function Contracts

### `saveGame(record)`

- Validates the record before storage.
- Writes `codename:game:{gameId}` with an atomic 86,400-second TTL.
- Returns success or throws/returns a typed persistence failure.

### `loadPublicGame(gameId)`

- Returns `PublicGameView` for a valid active record.
- Returns `unavailable` for missing, expired, or malformed records.
- Never returns the complete record.

### `loadLeaderGame(gameId, token)`

- Returns `LeaderGameView` only when record and token are valid.
- Returns the same `unavailable` result for all failures.
- Never returns the stored token.

## Verification Contract

Automated tests MUST prove:

- Public page HTML/RSC application payload does not contain the known test token or assignment fields.
- Public page references only the token-free QR image path.
- QR SVG decodes with `@zxing/browser` to the expected private leader URL.
- Invalid leader tokens expose no board data.
- Two games cannot cross-load public or private projections.
