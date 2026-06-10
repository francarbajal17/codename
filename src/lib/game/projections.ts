import type {
  GameRecord,
  LeaderGameView,
  PublicGameView,
} from "@/lib/game/types";

export function toPublicGameView(record: GameRecord): PublicGameView {
  return {
    gameId: record.gameId,
    language: record.language,
    startingTeam: record.startingTeam,
    cards: record.cards.map(({ position, word }) => ({ position, word })),
    expiresAt: record.expiresAt,
    qrImagePath: `/games/${record.gameId}/leader-qr`,
  };
}

export function toLeaderGameView(record: GameRecord): LeaderGameView {
  return {
    gameId: record.gameId,
    language: record.language,
    startingTeam: record.startingTeam,
    cards: record.cards.map(({ position, word, assignment }) => ({
      position,
      word,
      assignment,
    })),
    expiresAt: record.expiresAt,
  };
}
