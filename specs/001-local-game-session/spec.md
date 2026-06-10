# Feature Specification: Local Game Session

**Feature Branch**: `001-local-game-session`

**Created**: 2026-06-10

**Status**: Draft

**Input**: User description: "Create and play a local in-person game session through a public web app."

## Clarifications

### Session 2026-06-10

- Q: Where should the starting team be shown? → A: Show it on both the shared board and leader view.
- Q: How long should a game remain active? → A: 24 hours from creation.
- Q: Which word-list languages should the MVP support? → A: Separate English and Spanish lists,
  selected before game creation.
- Q: How private must the leader QR link be? → A: Anyone may scan it; players are responsible for
  following the in-room game rules.
- Q: Does Spanish selection translate the interface? → A: No, only the board words for the MVP.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Start a Shared Game (Priority: P1)

As a host, I can open the public application and start a game without signing in so that my group
can quickly gather around a shared 5x5 word board and begin preparing to play.

**Why this priority**: The shared board is the foundation of the in-person experience. Without it,
the group has no playable session.

**Independent Test**: Open the application as a new visitor, start a game, and verify that a unique
game page appears with exactly 25 readable words arranged in a 5x5 board and a scannable QR code.

**Acceptance Scenarios**:

1. **Given** a host has opened the public application, **When** the host prepares to start a game,
   **Then** the host can select either English or Spanish as the game's word-list language.
2. **Given** a host has selected a language, **When** the host starts a new game, **Then** the host
   reaches a new game page without being asked to create an account or sign in.
3. **Given** a new game has been created, **When** the game page is displayed, **Then** it shows
   exactly 25 words arranged as a 5x5 board.
4. **Given** a game was created using English or Spanish, **When** its public or private view opens,
   **Then** all 25 words come from the selected language's word list and the language does not change.
5. **Given** players are viewing the shared board, **When** they inspect any card, **Then** they see
   the word but no team ownership, neutral designation, bomb designation, or other secret-key clue.
6. **Given** a new game page is displayed, **When** the host and players view the page, **Then** a QR
   code for that game's private leader view is visible near the board without obscuring the words.
7. **Given** a new game has been created, **When** either the shared board or leader view is displayed,
   **Then** the same starting team is clearly identified without revealing card assignments on the
   shared board.

---

### User Story 2 - View the Private Leader Key (Priority: P2)

As a team leader, I can scan the QR code with my phone and privately view the key for the same game
so that I can identify red, blue, neutral, and bomb cards while the shared screen remains secret-free.

**Why this priority**: Leaders need the key to provide clues and play the game, but this journey only
has value after the shared game exists.

**Independent Test**: Scan the QR code from a created game, open its destination on a phone-sized
screen, and verify that all 25 board words appear in the same positions with each card clearly
identified as red, blue, neutral, or bomb.

**Acceptance Scenarios**:

1. **Given** a leader scans the QR code for an active game, **When** the link opens, **Then** the
   leader sees the private key for that same game without signing in.
2. **Given** the leader view is open, **When** the leader compares it with the shared board, **Then**
   all 25 words and their positions match the shared board exactly.
3. **Given** the leader views the key on a phone, **When** the full board is displayed, **Then** red,
   blue, neutral, and bomb cards are distinguishable using clear labels or visual treatment that
   does not rely on color alone.
4. **Given** the leader view has been opened, **When** other players continue looking at the shared
   screen, **Then** no leader-only information appears there.

---

### User Story 3 - Return to an Active Game (Priority: P3)

As a participant, I can revisit an active game's shared or private URL and receive a clear message
when a game is no longer available so that accidental navigation does not leave the group confused.

**Why this priority**: Recovering an active session and understanding unavailable links make the
core experience resilient, but neither is required for the first successful page load.

**Independent Test**: Reopen both URLs for an active game and verify the correct views return, then
open an invalid or unavailable game URL and verify a friendly error state appears without showing
another game's information.

**Acceptance Scenarios**:

1. **Given** a game is still active, **When** its public game URL is reopened, **Then** the same public
   word board and QR code are displayed.
2. **Given** a game is still active, **When** its valid private leader URL is reopened, **Then** the
   same matching secret key is displayed.
3. **Given** fewer than 24 hours have passed since game creation, **When** a participant opens a valid
   public or private game URL, **Then** the corresponding game view remains available.
4. **Given** 24 hours or more have passed since game creation, **When** a participant opens either
   game URL, **Then** the game is treated as unavailable.
5. **Given** a game identifier is invalid, unknown, or no longer active, **When** a user opens its
   public URL, **Then** a friendly unavailable-game message explains that a new game can be started.
6. **Given** a private leader link is invalid, incomplete, or no longer active, **When** it is opened,
   **Then** a friendly unavailable-game message appears and no board or secret information is shown.

---

### User Story 4 - Keep Group Games Independent (Priority: P4)

As one of several groups using the public application, I receive a game that is independent from
other groups so that our board and private key cannot be mixed with another session.

**Why this priority**: Public availability requires isolation between groups, even though a single
group can demonstrate the main play flow without concurrent usage.

**Independent Test**: Create two games in separate browser sessions and verify their public and
private links remain paired only with their own boards and never display data from the other game.

**Acceptance Scenarios**:

1. **Given** two hosts start new games, **When** both game pages are opened, **Then** each game has a
   distinct game URL and a QR code leading only to its own leader view.
2. **Given** two active games exist, **When** either public or private URL is revisited, **Then** it
   displays only the board or key belonging to that URL's game.
3. **Given** a leader link from one game is opened, **When** its key is compared with both public
   boards, **Then** it matches its own game's words and positions and does not expose the other game.

### Edge Cases

- A host starts a game and refreshes or revisits the page while the game remains active.
- A QR scanner opens an incomplete, altered, or malformed private link.
- A public or private URL refers to a game that has expired between page navigation and display.
- A user opens a private link for a valid game with an invalid access value.
- Two game-creation requests occur at nearly the same time.
- Random word selection cannot produce 25 distinct words from the available word pool.
- A host changes the language selection before creating a game; only the final selection is used.
- A phone has a narrow viewport or increased text-size settings.
- The shared display has limited vertical space and must keep all 25 words legible alongside the QR
  code.
- Game creation or game retrieval temporarily fails; the user receives a useful retry path without
  seeing partial or secret game data.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The public application MUST allow a host to create a new game without an account,
  login, or prior setup.
- **FR-002**: Before creating a game, the host MUST be able to select either English or Spanish as the
  game's word-list language.
- **FR-003**: Each successful creation request MUST produce a uniquely addressable game that remains
  separate from all other games.
- **FR-004**: Each game MUST contain exactly 25 distinct words randomly selected from the separate
  curated word list for the language selected at creation.
- **FR-005**: A game's selected word-list language MUST remain fixed for the game's lifetime and MUST
  apply to both its public board and private leader view.
- **FR-006**: The public game view MUST display the 25 words in a 5-column by 5-row board while
  preserving a stable word position for the lifetime of the game.
- **FR-007**: The public game view MUST display a QR code that opens the private leader view for that
  exact game.
- **FR-008**: The public game view MUST NOT reveal card ownership, neutral cards, the bomb, or the
  private access value as readable text or serialized application data. The visible QR code MAY
  encode the private leader URL as its intended access mechanism.
- **FR-009**: Each game's complete key MUST assign every board position to exactly one of red team,
  blue team, neutral, or bomb.
- **FR-010**: Each game MUST contain exactly 9 cards for the starting team, 8 cards for the other
  team, 7 neutral cards, and 1 bomb; either red or blue MAY be selected as the starting team.
- **FR-011**: The public game view and private leader view MUST clearly identify the same starting
  team.
- **FR-012**: The private leader view MUST display the same 25 words in the same positions as the
  public board and clearly distinguish red, blue, neutral, and bomb assignments.
- **FR-013**: The private leader view MUST require the game-specific private link represented by the
  QR code and MUST show no game information when that link is invalid or incomplete.
- **FR-014**: Active public and private game URLs MUST reopen the same board and matching key rather
  than creating or selecting a different game.
- **FR-015**: Each game MUST remain active for 24 hours from its creation time and MUST become
  unavailable once that period has elapsed.
- **FR-016**: Invalid, unknown, expired, or otherwise unavailable game links MUST show a clear,
  friendly message and an obvious path to start a new game.
- **FR-017**: A failed game-creation attempt MUST show a clear failure message and allow the host to
  retry without displaying a partial board.
- **FR-018**: The shared board MUST keep all words readable on typical laptop and desktop displays
  without requiring players to reveal or navigate to leader-only information.
- **FR-019**: The private leader view MUST remain readable and operable on a typical phone in portrait
  orientation.
- **FR-020**: Interactive controls MUST have understandable labels, visible focus states, and keyboard
  operation where applicable.
- **FR-021**: Card categories in the leader view MUST be identifiable by text, symbols, or another
  cue in addition to color.
- **FR-022**: The experience MUST NOT present account, lobby, matchmaking, chat, score-history,
  payment, administration, or remote synchronization flows.
- **FR-023**: Selecting Spanish MUST change only the board word list; interface controls, status
  messages, and instructions MAY remain in English for the MVP.

### Information Classification *(mandatory when feature handles game data)*

- **Public data**: The game's public identifier, selected word-list language, ordered list of 25
  words, starting team, public game availability, and the QR code image displayed on the shared game
  page. The QR destination is intended to be shared directly with leaders but MUST NOT be rendered
  as readable secret text on the main screen.
- **Leader-only data**: Every card's red, blue, neutral, or bomb assignment.
- **QR access data**: The private access value is intentionally encoded only in the visible QR code
  and the resulting private leader URL. Anyone in the room may scan it; compliance with the game
  roles is the players' responsibility.
- **Exposure prevention**: The shared board and public application data MUST contain no ownership,
  neutral, bomb, or readable private-access data. Invalid private links MUST return no board or key
  data. A user following one game's public URL MUST never receive another game's data.

### Scope Exclusions *(mandatory)*

- User accounts, login, identity management, and advanced permissions are excluded because the MVP
  is designed for immediate in-room play.
- Online matchmaking, public lobbies, chat, and real-time synchronization are excluded because all
  players are assumed to be physically together around one shared board.
- Score history, permanent game history, and long-term saved sessions are excluded because games are
  temporary.
- User-provided custom word lists and administrative tools are excluded; the MVP provides separate
  built-in English and Spanish lists to keep setup immediate and uniform.
- Payments and subscriptions are excluded because monetization is not part of this MVP.
- Card selection, turn tracking, scoring, timers, and automatic win detection are excluded; players
  use the displayed board and key to manage play verbally in person.
- Future online modes and account features MUST NOT add visible steps or concepts to this feature's
  creation and play journey.

### Key Entities *(include if feature involves data)*

- **Game**: A temporary independent session with a public identifier, selected word-list language,
  availability state, ordered board, private access value, secret key, and active lifetime.
- **Board Card**: One of 25 stable positions in a game, containing a distinct display word and one
  secret assignment.
- **Secret Key**: The complete set of assignments that classifies every board position as red, blue,
  neutral, or bomb and is visible only through the valid private leader link.
- **Leader Link**: A game-specific private destination encoded by the QR code and used by leaders to
  access the matching secret key.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a timed acceptance test, a first-time host can create a game and reach a complete
  playable board within 30 seconds without instructions or assistance.
- **SC-002**: In a timed acceptance test, a team leader can scan the QR code and identify the private
  key on a phone within 20 seconds.
- **SC-003**: Every successfully created game displays exactly 25 distinct words in a 5x5 board.
- **SC-004**: In all acceptance and release tests, the shared board reveals zero card assignments,
  bomb indicators, or readable private access values.
- **SC-005**: At viewport sizes from 1024x768 through 1920x1080, the shared board displays all 25
  words without horizontal scrolling, overlap, or clipping.
- **SC-006**: At phone portrait viewport widths from 320 through 430 pixels, the leader view displays
  all card words and category cues without horizontal scrolling or clipped controls.
- **SC-007**: Across at least 100 pairs of concurrently created games, every public board and leader
  key remains associated only with its own game, with zero cross-game information exposure.
- **SC-008**: Every tested invalid, altered, unknown, or expired game link presents an understandable
  unavailable-game state and exposes no game data.
- **SC-009**: The complete start-board-scan-key journey succeeds on current desktop and mobile
  browsers through the same public application address.

## Assumptions

- Players and leaders are physically together in the same room and communicate verbally.
- One laptop or desktop display serves as the shared public board.
- Team leaders have phones with internet access and QR-scanning capability.
- The English and Spanish word lists are separate curated lists; words are not translated while a
  game is active.
- Interface controls, instructions, and error messages remain in English for the MVP regardless of
  the selected word-list language.
- A standard 25-card key uses 9 cards for the starting team, 8 for the other team, 7 neutral cards,
  and 1 bomb; the starting team and position assignments are generated per game.
- The QR code may be visible to everyone near the shared screen; privacy relies on players following
  the social rules of the in-person game and on the unpredictability of the private link.
- A private link may be shared between the leaders for the same game.
- Games remain available for 24 hours from creation. Revisiting a game does not extend its lifetime.
- Players manually manage clues, guesses, turns, scoring, and completion outside the application.
- Users have a stable enough internet connection to load the public board and leader view.
