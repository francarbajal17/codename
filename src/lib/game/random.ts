import { randomInt } from "node:crypto";

export type RandomSource = () => number;

export const secureRandom: RandomSource = () =>
  randomInt(0, 0x1_0000_0000) / 0x1_0000_0000;

export function shuffle<T>(values: readonly T[], random: RandomSource): T[] {
  const shuffled = [...values];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }
  return shuffled;
}

export function choose<T>(values: readonly T[], random: RandomSource): T {
  if (values.length === 0) throw new Error("Cannot choose from an empty list");
  return values[Math.floor(random() * values.length)];
}
