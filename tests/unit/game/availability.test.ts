import { describe, expect, it } from "vitest";

import { isGameActive } from "@/lib/game/availability";
import { buildGameRecord } from "../../helpers/game-fixtures";

describe("isGameActive", () => {
  const game = buildGameRecord();

  it("is active from creation until immediately before expiration", () => {
    expect(isGameActive(game, new Date(game.createdAt))).toBe(true);
    expect(isGameActive(game, new Date(Date.parse(game.expiresAt) - 1))).toBe(
      true,
    );
  });

  it("is expired at the expiration instant and after it", () => {
    expect(isGameActive(game, new Date(game.expiresAt))).toBe(false);
    expect(isGameActive(game, new Date(Date.parse(game.expiresAt) + 1))).toBe(
      false,
    );
  });
});
