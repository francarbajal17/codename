import { Redis } from "@upstash/redis";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { getServerEnv } from "@/lib/config/env";

export interface GameStore {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, options: { ex: number }): Promise<unknown>;
  ttl(key: string): Promise<number>;
}

interface TestEntry {
  value: unknown;
  expiresAt: number;
}

const testStoreDirectory = path.join(tmpdir(), "codename-e2e-game-store");

function testStorePath(key: string): string {
  return path.join(
    testStoreDirectory,
    `${Buffer.from(key).toString("base64url")}.json`,
  );
}

const testStore: GameStore = {
  async get<T>(key: string) {
    let entry: TestEntry;
    try {
      entry = JSON.parse(
        await readFile(testStorePath(key), "utf8"),
      ) as TestEntry;
    } catch {
      return null;
    }
    return entry.expiresAt <= Date.now() ? null : (entry.value as T);
  },
  async set(key, value, options) {
    await mkdir(testStoreDirectory, { recursive: true });
    await writeFile(
      testStorePath(key),
      JSON.stringify({ value, expiresAt: Date.now() + options.ex * 1_000 }),
      "utf8",
    );
    return "OK";
  },
  async ttl(key) {
    let entry: TestEntry;
    try {
      entry = JSON.parse(
        await readFile(testStorePath(key), "utf8"),
      ) as TestEntry;
    } catch {
      return -2;
    }
    return Math.max(0, Math.ceil((entry.expiresAt - Date.now()) / 1_000));
  },
};

let store: GameStore | undefined;

export function getGameStore(): GameStore {
  if (store) return store;

  const env = getServerEnv();
  store = env.useMemoryRedis
    ? testStore
    : new Redis({ url: env.redisUrl, token: env.redisToken });
  return store;
}

export function setGameStoreForTests(nextStore: GameStore | undefined): void {
  store = nextStore;
}
