import type { GameStore } from "@/lib/persistence/redis";

interface StoredValue {
  value: unknown;
  ttl: number;
}

export class FakeRedis implements GameStore {
  readonly values = new Map<string, StoredValue>();
  readonly calls: Array<{ key: string; operation: string }> = [];

  async get<T>(key: string): Promise<T | null> {
    this.calls.push({ key, operation: "get" });
    return (
      (structuredClone(this.values.get(key)?.value) as T | undefined) ?? null
    );
  }

  async set(
    key: string,
    value: unknown,
    options: { ex: number },
  ): Promise<"OK"> {
    this.calls.push({ key, operation: "set" });
    this.values.set(key, { value: structuredClone(value), ttl: options.ex });
    return "OK";
  }

  async ttl(key: string): Promise<number> {
    this.calls.push({ key, operation: "ttl" });
    return this.values.get(key)?.ttl ?? -2;
  }
}
