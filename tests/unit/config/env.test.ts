import { describe, expect, it } from "vitest";

import { parseServerEnv } from "@/lib/config/env";

describe("parseServerEnv", () => {
  it("accepts local development without an explicit origin", () => {
    expect(
      parseServerEnv({
        NODE_ENV: "development",
        UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
        UPSTASH_REDIS_REST_TOKEN: "token",
      }),
    ).toMatchObject({ appOrigin: "http://localhost:3000" });
  });

  it("requires a trusted HTTPS origin in production", () => {
    expect(() =>
      parseServerEnv({
        NODE_ENV: "production",
        UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
        UPSTASH_REDIS_REST_TOKEN: "token",
      }),
    ).toThrow("APP_ORIGIN");
  });

  it("does not include credential values in errors", () => {
    expect(() =>
      parseServerEnv({
        NODE_ENV: "production",
        UPSTASH_REDIS_REST_URL: "not-a-url",
        UPSTASH_REDIS_REST_TOKEN: "super-secret-token",
        APP_ORIGIN: "https://codename.example",
      }),
    ).toThrowError(/UPSTASH_REDIS_REST_URL/);

    try {
      parseServerEnv({
        NODE_ENV: "production",
        UPSTASH_REDIS_REST_URL: "not-a-url",
        UPSTASH_REDIS_REST_TOKEN: "super-secret-token",
        APP_ORIGIN: "https://codename.example",
      });
    } catch (error) {
      expect(String(error)).not.toContain("super-secret-token");
    }
  });
});
