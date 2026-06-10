import { describe, expect, it } from "vitest";

import { generateGame } from "@/lib/game/generate";
import { validateGameRecord } from "@/lib/game/validate";
import { buildGameRecord } from "../../helpers/game-fixtures";

describe("validateGameRecord", () => {
  it.each([
    ["red", { red: 9, blue: 8, neutral: 7, bomb: 1 }],
    ["blue", { red: 8, blue: 9, neutral: 7, bomb: 1 }],
  ] as const)(
    "accepts valid %s-starting assignment counts",
    (startingTeam, counts) => {
      const assignments = [
        ...Array(counts.red).fill("red" as const),
        ...Array(counts.blue).fill("blue" as const),
        ...Array(counts.neutral).fill("neutral" as const),
        ...Array(counts.bomb).fill("bomb" as const),
      ];
      const base = buildGameRecord({ startingTeam });
      const record = {
        ...base,
        cards: base.cards.map((card, position) => ({
          ...card,
          assignment: assignments[position],
        })),
      };

      expect(validateGameRecord(record)).toEqual(record);
    },
  );

  it("rejects malformed records", () => {
    expect(() => validateGameRecord({ gameId: "not-enough" })).toThrow();
  });

  it("rejects an invalid assignment distribution", () => {
    const record = buildGameRecord();
    record.cards[24] = { ...record.cards[24], assignment: "neutral" };

    expect(() => validateGameRecord(record)).toThrow(/assignment/i);
  });

  it("rejects duplicate, missing, and foreign words", () => {
    const duplicate = buildGameRecord();
    duplicate.cards[1] = {
      ...duplicate.cards[1],
      word: duplicate.cards[0].word,
    };
    expect(() => validateGameRecord(duplicate)).toThrow(/word/i);

    const foreign = buildGameRecord();
    foreign.cards[0] = { ...foreign.cards[0], word: "not-in-the-list" };
    expect(() => validateGameRecord(foreign)).toThrow(/word/i);
  });

  it("rejects timestamps that are not exactly 24 hours apart", () => {
    const record = buildGameRecord({ expiresAt: "2026-06-11T11:59:59.000Z" });
    expect(() => validateGameRecord(record)).toThrow(/24 hours/i);
  });

  it("rejects word pools that cannot produce 25 distinct cards", () => {
    expect(() =>
      generateGame({
        language: "en",
        gameId: "00000000-0000-4000-8000-000000000001",
        leaderToken: "a".repeat(43),
        now: new Date("2026-06-10T12:00:00.000Z"),
        random: () => 0.5,
        words: Array(25).fill("duplicate"),
      }),
    ).toThrow(/25 unique words/i);
  });

  it.each([
    ["schema version", () => ({ ...buildGameRecord(), schemaVersion: 99 })],
    ["game ID", () => ({ ...buildGameRecord(), gameId: "invalid" })],
    ["language", () => ({ ...buildGameRecord(), language: "fr" })],
    ["starting team", () => ({ ...buildGameRecord(), startingTeam: "green" })],
    ["card count", () => ({ ...buildGameRecord(), cards: [] })],
    ["leader token", () => ({ ...buildGameRecord(), leaderToken: "short" })],
    [
      "creation timestamp",
      () => ({ ...buildGameRecord(), createdAt: "not-a-date" }),
    ],
    [
      "expiration timestamp",
      () => ({ ...buildGameRecord(), expiresAt: "not-a-date" }),
    ],
    [
      "positions",
      () => {
        const record = buildGameRecord();
        record.cards[1] = { ...record.cards[1], position: 0 };
        return record;
      },
    ],
    [
      "empty word",
      () => {
        const record = buildGameRecord();
        record.cards[0] = { ...record.cards[0], word: "" };
        return record;
      },
    ],
    [
      "assignment value",
      () => {
        const record = buildGameRecord();
        return {
          ...record,
          cards: [
            { ...record.cards[0], assignment: "green" },
            ...record.cards.slice(1),
          ],
        };
      },
    ],
  ])("rejects an invalid %s", (_label, buildInvalid) => {
    expect(() => validateGameRecord(buildInvalid())).toThrow();
  });
});
