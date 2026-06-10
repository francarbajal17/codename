import { randomBytes, randomUUID } from "node:crypto";

import { LEADER_TOKEN_BYTES } from "@/lib/game/constants";

export function createGameId(): string {
  return randomUUID();
}

export function createLeaderToken(): string {
  return randomBytes(LEADER_TOKEN_BYTES).toString("base64url");
}
