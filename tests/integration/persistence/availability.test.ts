import { describe, expect, it } from "vitest";

import { REDIS_GAME_KEY_PREFIX } from "@/lib/game/constants";
import {
  loadLeaderGame,
  loadPublicGame,
  saveGame,
} from "@/lib/persistence/games";
import { FakeRedis } from "../../helpers/fake-redis";
import { buildGameRecord } from "../../helpers/game-fixtures";

describe("game availability persistence", () => {
  it("returns unavailable for missing, expired, and malformed records", async () => {
    const store = new FakeRedis();
    const expired = buildGameRecord({
      gameId: "00000000-0000-4000-8000-000000000002",
      createdAt: "2020-01-01T00:00:00.000Z",
      expiresAt: "2020-01-02T00:00:00.000Z",
    });
    await saveGame(expired, store);
    store.values.set(
      `${REDIS_GAME_KEY_PREFIX}00000000-0000-4000-8000-000000000003`,
      { value: { broken: true }, ttl: 100 },
    );

    await expect(loadPublicGame(expired.gameId, store)).resolves.toEqual({
      status: "unavailable",
    });
    await expect(
      loadPublicGame("00000000-0000-4000-8000-000000000003", store),
    ).resolves.toEqual({ status: "unavailable" });
    await expect(
      loadPublicGame("00000000-0000-4000-8000-000000000099", store),
    ).resolves.toEqual({ status: "unavailable" });
    await expect(
      loadLeaderGame(expired.gameId, expired.leaderToken, store),
    ).resolves.toEqual({
      status: "unavailable",
    });
  });

  it("does not refresh TTL after repeated public or leader loads", async () => {
    const store = new FakeRedis();
    const record = buildGameRecord();
    await saveGame(record, store);
    store.calls.length = 0;

    await loadPublicGame(record.gameId, store);
    await loadPublicGame(record.gameId, store);
    await loadLeaderGame(record.gameId, record.leaderToken, store);

    expect(store.calls.every((call) => call.operation === "get")).toBe(true);
  });
});
