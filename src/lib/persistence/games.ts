import { timingSafeEqual } from "node:crypto";

import { GAME_TTL_SECONDS, REDIS_GAME_KEY_PREFIX } from "@/lib/game/constants";
import { isGameActive } from "@/lib/game/availability";
import { toLeaderGameView, toPublicGameView } from "@/lib/game/projections";
import type {
  GameLoadResult,
  GameRecord,
  LeaderGameView,
  PublicGameView,
} from "@/lib/game/types";
import { isValidLeaderToken, validateGameRecord } from "@/lib/game/validate";
import { getGameStore, type GameStore } from "@/lib/persistence/redis";

export function gameKey(gameId: string): string {
  return `${REDIS_GAME_KEY_PREFIX}${gameId}`;
}

export async function saveGame(
  value: GameRecord,
  store: GameStore = getGameStore(),
): Promise<void> {
  const record = validateGameRecord(value);
  await store.set(gameKey(record.gameId), record, { ex: GAME_TTL_SECONDS });
}

async function loadGameRecord(
  gameId: string,
  store: GameStore,
): Promise<GameRecord | null> {
  try {
    const value = await store.get<unknown>(gameKey(gameId));
    if (value === null) return null;
    const record = validateGameRecord(value);
    return record.gameId === gameId && isGameActive(record) ? record : null;
  } catch {
    return null;
  }
}

export async function loadPublicGame(
  gameId: string,
  store: GameStore = getGameStore(),
): Promise<GameLoadResult<PublicGameView>> {
  const record = await loadGameRecord(gameId, store);
  return record
    ? { status: "available", game: toPublicGameView(record) }
    : { status: "unavailable" };
}

export async function loadGameForQr(
  gameId: string,
  store: GameStore = getGameStore(),
): Promise<{ gameId: string; leaderToken: string } | null> {
  const record = await loadGameRecord(gameId, store);
  return record
    ? { gameId: record.gameId, leaderToken: record.leaderToken }
    : null;
}

export async function loadLeaderGame(
  gameId: string,
  token: string,
  store: GameStore = getGameStore(),
): Promise<GameLoadResult<LeaderGameView>> {
  if (!isValidLeaderToken(token)) return { status: "unavailable" };
  const record = await loadGameRecord(gameId, store);
  if (!record) return { status: "unavailable" };

  const supplied = Buffer.from(token);
  const expected = Buffer.from(record.leaderToken);
  if (
    supplied.length !== expected.length ||
    !timingSafeEqual(supplied, expected)
  ) {
    return { status: "unavailable" };
  }

  return { status: "available", game: toLeaderGameView(record) };
}
