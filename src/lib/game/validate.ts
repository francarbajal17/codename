import {
  BOARD_SIZE,
  BOMB_CARD_COUNT,
  GAME_SCHEMA_VERSION,
  GAME_TTL_MS,
  LEADER_TOKEN_BYTES,
  NEUTRAL_CARD_COUNT,
  OTHER_TEAM_CARD_COUNT,
  STARTING_TEAM_CARD_COUNT,
} from "@/lib/game/constants";
import type {
  BoardCard,
  CardAssignment,
  GameRecord,
  Team,
  WordListLanguage,
} from "@/lib/game/types";
import { CARD_ASSIGNMENTS } from "@/lib/game/types";
import { ENGLISH_WORDS } from "@/lib/game/words/en";
import { SPANISH_WORDS } from "@/lib/game/words/es";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TOKEN_PATTERN = /^[A-Za-z0-9_-]+$/;
const WORDS = {
  en: new Set<string>(ENGLISH_WORDS),
  es: new Set<string>(SPANISH_WORDS),
} satisfies Record<WordListLanguage, Set<string>>;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function isLanguage(value: unknown): value is WordListLanguage {
  return value === "en" || value === "es";
}

function isTeam(value: unknown): value is Team {
  return value === "red" || value === "blue";
}

function isAssignment(value: unknown): value is CardAssignment {
  return CARD_ASSIGNMENTS.includes(value as CardAssignment);
}

function validateCard(value: unknown): BoardCard {
  assert(value !== null && typeof value === "object", "Invalid card");
  const card = value as Record<string, unknown>;
  assert(Number.isInteger(card.position), "Invalid card position");
  assert(typeof card.word === "string" && card.word.length > 0, "Invalid word");
  assert(isAssignment(card.assignment), "Invalid card assignment");
  return card as unknown as BoardCard;
}

export function validateGameRecord(value: unknown): GameRecord {
  assert(value !== null && typeof value === "object", "Invalid game record");
  const record = value as Record<string, unknown>;
  assert(
    record.schemaVersion === GAME_SCHEMA_VERSION,
    "Invalid schema version",
  );
  assert(
    typeof record.gameId === "string" && UUID_PATTERN.test(record.gameId),
    "Invalid game ID",
  );
  assert(isLanguage(record.language), "Invalid language");
  const language = record.language;
  assert(isTeam(record.startingTeam), "Invalid starting team");
  assert(
    Array.isArray(record.cards) && record.cards.length === BOARD_SIZE,
    "Invalid card count",
  );
  assert(
    typeof record.leaderToken === "string" &&
      TOKEN_PATTERN.test(record.leaderToken) &&
      Buffer.from(record.leaderToken, "base64url").length ===
        LEADER_TOKEN_BYTES,
    "Invalid leader token",
  );
  assert(typeof record.createdAt === "string", "Invalid creation timestamp");
  assert(typeof record.expiresAt === "string", "Invalid expiration timestamp");

  const cards = record.cards.map(validateCard);
  const positions = cards.map((card) => card.position).sort((a, b) => a - b);
  assert(
    positions.every((position, index) => position === index),
    "Invalid card positions",
  );
  assert(
    new Set(cards.map((card) => card.word)).size === BOARD_SIZE,
    "Invalid duplicate word",
  );
  assert(
    cards.every((card) => WORDS[language].has(card.word)),
    "Invalid word for language",
  );

  const counts = cards.reduce<Record<CardAssignment, number>>(
    (result, card) => ({
      ...result,
      [card.assignment]: result[card.assignment] + 1,
    }),
    { red: 0, blue: 0, neutral: 0, bomb: 0 },
  );
  const otherTeam = record.startingTeam === "red" ? "blue" : "red";
  assert(
    counts[record.startingTeam] === STARTING_TEAM_CARD_COUNT &&
      counts[otherTeam] === OTHER_TEAM_CARD_COUNT &&
      counts.neutral === NEUTRAL_CARD_COUNT &&
      counts.bomb === BOMB_CARD_COUNT,
    "Invalid assignment counts",
  );

  const createdAt = Date.parse(record.createdAt);
  const expiresAt = Date.parse(record.expiresAt);
  assert(
    Number.isFinite(createdAt) && Number.isFinite(expiresAt),
    "Invalid timestamps",
  );
  assert(
    expiresAt - createdAt === GAME_TTL_MS,
    "Game must expire in exactly 24 hours",
  );

  return {
    schemaVersion: GAME_SCHEMA_VERSION,
    gameId: record.gameId,
    language,
    startingTeam: record.startingTeam,
    cards,
    leaderToken: record.leaderToken,
    createdAt: record.createdAt,
    expiresAt: record.expiresAt,
  };
}

export function isValidLeaderToken(value: string): boolean {
  return (
    TOKEN_PATTERN.test(value) &&
    Buffer.from(value, "base64url").length === LEADER_TOKEN_BYTES
  );
}
