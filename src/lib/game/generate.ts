import {
  BOARD_SIZE,
  BOMB_CARD_COUNT,
  GAME_SCHEMA_VERSION,
  GAME_TTL_MS,
  NEUTRAL_CARD_COUNT,
  OTHER_TEAM_CARD_COUNT,
  STARTING_TEAM_CARD_COUNT,
} from "@/lib/game/constants";
import { choose, shuffle, type RandomSource } from "@/lib/game/random";
import type {
  CardAssignment,
  GameRecord,
  Team,
  WordListLanguage,
} from "@/lib/game/types";
import { ENGLISH_WORDS } from "@/lib/game/words/en";
import { SPANISH_WORDS } from "@/lib/game/words/es";

interface GenerateGameOptions {
  language: WordListLanguage;
  gameId: string;
  leaderToken: string;
  now: Date;
  random: RandomSource;
  words?: readonly string[];
}

const WORDS_BY_LANGUAGE = {
  en: ENGLISH_WORDS,
  es: SPANISH_WORDS,
} satisfies Record<WordListLanguage, readonly string[]>;

export function generateGame(options: GenerateGameOptions): GameRecord {
  const words = options.words ?? WORDS_BY_LANGUAGE[options.language];
  if (new Set(words).size < BOARD_SIZE) {
    throw new Error("Word pool must contain at least 25 unique words");
  }
  const startingTeam = choose<Team>(["red", "blue"], options.random);
  const otherTeam: Team = startingTeam === "red" ? "blue" : "red";
  const selectedWords = shuffle(words, options.random).slice(0, BOARD_SIZE);
  const assignments = shuffle<CardAssignment>(
    [
      ...Array<CardAssignment>(STARTING_TEAM_CARD_COUNT).fill(startingTeam),
      ...Array<CardAssignment>(OTHER_TEAM_CARD_COUNT).fill(otherTeam),
      ...Array<CardAssignment>(NEUTRAL_CARD_COUNT).fill("neutral"),
      ...Array<CardAssignment>(BOMB_CARD_COUNT).fill("bomb"),
    ],
    options.random,
  );
  const createdAt = options.now.toISOString();

  return {
    schemaVersion: GAME_SCHEMA_VERSION,
    gameId: options.gameId,
    language: options.language,
    startingTeam,
    cards: selectedWords.map((word, position) => ({
      position,
      word,
      assignment: assignments[position],
    })),
    leaderToken: options.leaderToken,
    createdAt,
    expiresAt: new Date(options.now.getTime() + GAME_TTL_MS).toISOString(),
  };
}
