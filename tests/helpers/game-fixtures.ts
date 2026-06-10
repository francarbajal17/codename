import { GAME_SCHEMA_VERSION, GAME_TTL_MS } from "@/lib/game/constants";
import type { CardAssignment, GameRecord } from "@/lib/game/types";
import { ENGLISH_WORDS } from "@/lib/game/words/en";

const assignments: CardAssignment[] = [
  ...Array<CardAssignment>(9).fill("red"),
  ...Array<CardAssignment>(8).fill("blue"),
  ...Array<CardAssignment>(7).fill("neutral"),
  "bomb",
];

export function buildGameRecord(
  overrides: Partial<GameRecord> = {},
): GameRecord {
  const createdAt = overrides.createdAt ?? "2026-06-10T12:00:00.000Z";
  return {
    schemaVersion: GAME_SCHEMA_VERSION,
    gameId: "00000000-0000-4000-8000-000000000001",
    language: "en",
    startingTeam: "red",
    cards: assignments.map((assignment, position) => ({
      position,
      word: ENGLISH_WORDS[position],
      assignment,
    })),
    leaderToken: "a".repeat(43),
    createdAt,
    expiresAt: new Date(
      new Date(createdAt).getTime() + GAME_TTL_MS,
    ).toISOString(),
    ...overrides,
  };
}
