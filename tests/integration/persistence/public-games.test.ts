import { describe, expect, it } from "vitest";

import { GAME_TTL_SECONDS, REDIS_GAME_KEY_PREFIX } from "@/lib/game/constants";
import { loadPublicGame, saveGame } from "@/lib/persistence/games";
import { FakeRedis } from "../../helpers/fake-redis";
import { buildGameRecord } from "../../helpers/game-fixtures";

describe("public game persistence", () => {
  it("stores a complete game atomically under its scoped key with a 24-hour TTL", async () => {
    const store = new FakeRedis();
    const record = buildGameRecord();

    await saveGame(record, store);

    const key = `${REDIS_GAME_KEY_PREFIX}${record.gameId}`;
    expect(store.values.get(key)).toEqual({
      value: record,
      ttl: GAME_TTL_SECONDS,
    });
    expect(store.calls).toEqual([{ key, operation: "set" }]);
  });

  it("loads only the public projection without refreshing TTL", async () => {
    const store = new FakeRedis();
    const record = buildGameRecord();
    await saveGame(record, store);
    store.calls.length = 0;

    const result = await loadPublicGame(record.gameId, store);

    expect(result.status).toBe("available");
    expect(JSON.stringify(result)).not.toContain(record.leaderToken);
    expect(JSON.stringify(result)).not.toContain('"assignment"');
    expect(store.calls).toEqual([
      { key: `${REDIS_GAME_KEY_PREFIX}${record.gameId}`, operation: "get" },
    ]);
  });
});
