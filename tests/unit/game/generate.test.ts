import { describe, expect, it } from "vitest";

import { generateGame } from "@/lib/game/generate";
import { ENGLISH_WORDS } from "@/lib/game/words/en";
import { SPANISH_WORDS } from "@/lib/game/words/es";

const identity = {
  gameId: "00000000-0000-4000-8000-000000000001",
  leaderToken: "a".repeat(43),
};

function sequenceRandom(values: number[]) {
  let index = 0;
  return () => values[index++ % values.length];
}

describe("generateGame", () => {
  it.each([
    ["en", ENGLISH_WORDS],
    ["es", SPANISH_WORDS],
  ] as const)("selects words only from the %s list", (language, words) => {
    const game = generateGame({
      language,
      ...identity,
      now: new Date("2026-06-10T12:00:00.000Z"),
      random: sequenceRandom([0.13, 0.78, 0.42, 0.91]),
    });

    expect(game.cards).toHaveLength(25);
    expect(
      game.cards.every((card) => new Set<string>(words).has(card.word)),
    ).toBe(true);
  });

  it("is deterministic when the random source is injected", () => {
    const options = {
      language: "en" as const,
      ...identity,
      now: new Date("2026-06-10T12:00:00.000Z"),
    };

    const first = generateGame({
      ...options,
      random: sequenceRandom([0.1, 0.9, 0.3, 0.7]),
    });
    const second = generateGame({
      ...options,
      random: sequenceRandom([0.1, 0.9, 0.3, 0.7]),
    });

    expect(first).toEqual(second);
  });

  it("creates exactly 25 distinct cards in stable row-major positions", () => {
    const game = generateGame({
      language: "es",
      ...identity,
      now: new Date("2026-06-10T12:00:00.000Z"),
      random: sequenceRandom([0.25, 0.5, 0.75]),
    });

    expect(game.cards.map((card) => card.position)).toEqual(
      Array.from({ length: 25 }, (_, position) => position),
    );
    expect(new Set(game.cards.map((card) => card.word))).toHaveLength(25);
  });
});
