import { describe, expect, it } from "vitest";

import { generateGame } from "@/lib/game/generate";
import { createGameId, createLeaderToken } from "@/lib/game/identity";
import { secureRandom } from "@/lib/game/random";
import {
  gameKey,
  loadLeaderGame,
  loadPublicGame,
  saveGame,
} from "@/lib/persistence/games";
import { FakeRedis } from "../../helpers/fake-redis";
import { buildGameRecord } from "../../helpers/game-fixtures";

describe("game isolation", () => {
  it("creates 100 independent records with unique identities, keys, boards, and projections", async () => {
    const store = new FakeRedis();
    const games = Array.from({ length: 100 }, () =>
      generateGame({
        language: "en",
        gameId: createGameId(),
        leaderToken: createLeaderToken(),
        now: new Date(),
        random: secureRandom,
      }),
    );

    await Promise.all(games.map((game) => saveGame(game, store)));
    const privateViews = await Promise.all(
      games.map((game) => loadLeaderGame(game.gameId, game.leaderToken, store)),
    );

    expect(new Set(games.map((game) => game.gameId))).toHaveLength(100);
    expect(new Set(games.map((game) => game.leaderToken))).toHaveLength(100);
    expect(new Set(games.map((game) => gameKey(game.gameId)))).toHaveLength(
      100,
    );
    expect(
      new Set(
        games.map((game) => game.cards.map((card) => card.word).join("|")),
      ),
    ).toHaveLength(100);
    expect(privateViews.every((result) => result.status === "available")).toBe(
      true,
    );
  });

  it("rejects cross-game tokens and records stored under the wrong key", async () => {
    const store = new FakeRedis();
    const first = buildGameRecord();
    const second = buildGameRecord({
      gameId: "00000000-0000-4000-8000-000000000002",
      leaderToken: "b".repeat(43),
    });
    await Promise.all([saveGame(first, store), saveGame(second, store)]);

    await expect(
      loadLeaderGame(first.gameId, second.leaderToken, store),
    ).resolves.toEqual({
      status: "unavailable",
    });

    store.values.set(gameKey(first.gameId), {
      value: second,
      ttl: 86_400,
    });
    await expect(loadPublicGame(first.gameId, store)).resolves.toEqual({
      status: "unavailable",
    });
  });
});
