import { describe, expect, it } from "vitest";

import { toLeaderGameView, toPublicGameView } from "@/lib/game/projections";
import { buildGameRecord } from "../../helpers/game-fixtures";

describe("game projections", () => {
  it("allowlists public fields and excludes every secret assignment", () => {
    const record = buildGameRecord();
    const view = toPublicGameView(record);

    expect(Object.keys(view).sort()).toEqual(
      [
        "cards",
        "expiresAt",
        "gameId",
        "language",
        "qrImagePath",
        "startingTeam",
      ].sort(),
    );
    expect(JSON.stringify(view)).not.toContain(record.leaderToken);
    expect(
      view.cards.every(
        (card) => Object.keys(card).sort().join() === "position,word",
      ),
    ).toBe(true);
    expect(view.qrImagePath).toBe(`/games/${record.gameId}/leader-qr`);
  });

  it("returns leader assignments without returning the bearer token", () => {
    const record = buildGameRecord();
    const view = toLeaderGameView(record);

    expect(view.cards.map((card) => card.assignment)).toEqual(
      record.cards.map((card) => card.assignment),
    );
    expect(JSON.stringify(view)).not.toContain(record.leaderToken);
  });
});
