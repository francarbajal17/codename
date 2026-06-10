export const WORD_LIST_LANGUAGES = ["en", "es"] as const;
export type WordListLanguage = (typeof WORD_LIST_LANGUAGES)[number];

export const TEAMS = ["red", "blue"] as const;
export type Team = (typeof TEAMS)[number];

export const CARD_ASSIGNMENTS = ["red", "blue", "neutral", "bomb"] as const;
export type CardAssignment = (typeof CARD_ASSIGNMENTS)[number];

export interface BoardCard {
  position: number;
  word: string;
  assignment: CardAssignment;
}

export interface GameRecord {
  schemaVersion: number;
  gameId: string;
  language: WordListLanguage;
  startingTeam: Team;
  cards: BoardCard[];
  leaderToken: string;
  createdAt: string;
  expiresAt: string;
}

export interface PublicBoardCard {
  position: number;
  word: string;
}

export interface PublicGameView {
  gameId: string;
  language: WordListLanguage;
  startingTeam: Team;
  cards: PublicBoardCard[];
  expiresAt: string;
  qrImagePath: string;
}

export interface LeaderBoardCard extends PublicBoardCard {
  assignment: CardAssignment;
}

export interface LeaderGameView {
  gameId: string;
  language: WordListLanguage;
  startingTeam: Team;
  cards: LeaderBoardCard[];
  expiresAt: string;
}

export type GameLoadResult<T> =
  | { status: "available"; game: T }
  | { status: "unavailable" };
