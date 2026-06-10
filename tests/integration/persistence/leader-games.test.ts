import { describe, expect, it } from "vitest";

import { loadLeaderGame, saveGame } from "@/lib/persistence/games";
import { FakeRedis } from "../../helpers/fake-redis";
import { buildGameRecord } from "../../helpers/game-fixtures";

describe("leader game persistence", () => {
  it("returns the matching private projection without returning the token", async () => {
    const store = new FakeRedis();
    const record = buildGameRecord();
    await saveGame(record, store);

    const result = await loadLeaderGame(
      record.gameId,
      record.leaderToken,
      store,
    );

    expect(result.status).toBe("available");
    expect(JSON.stringify(result)).not.toContain(record.leaderToken);
    if (result.status === "available") {
      expect(result.game.cards).toEqual(record.cards);
    }
  });

  it.each([
    ["mismatched", "b".repeat(43)],
    ["malformed", "short"],
  ])("returns unavailable for a %s token", async (_label, token) => {
    const store = new FakeRedis();
    const record = buildGameRecord();
    await saveGame(record, store);

    await expect(loadLeaderGame(record.gameId, token, store)).resolves.toEqual({
      status: "unavailable",
    });
  });

  it("returns unavailable for a missing game", async () => {
    await expect(
      loadLeaderGame(
        "00000000-0000-4000-8000-000000000099",
        "a".repeat(43),
        new FakeRedis(),
      ),
    ).resolves.toEqual({ status: "unavailable" });
  });
});
