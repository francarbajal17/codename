import type { GameRecord } from "@/lib/game/types";

export function isGameActive(
  record: GameRecord,
  now: Date = new Date(),
): boolean {
  const currentTime = now.getTime();
  return (
    currentTime >= Date.parse(record.createdAt) &&
    currentTime < Date.parse(record.expiresAt)
  );
}
