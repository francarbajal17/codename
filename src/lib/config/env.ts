export interface ServerEnv {
  redisUrl: string;
  redisToken: string;
  appOrigin: string;
  useMemoryRedis: boolean;
}

type EnvSource = Record<string, string | undefined>;

function requireUrl(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  try {
    return new URL(value).toString().replace(/\/$/, "");
  } catch {
    throw new Error(`Invalid URL in environment variable: ${name}`);
  }
}

export function parseServerEnv(source: EnvSource): ServerEnv {
  const isProduction = source.NODE_ENV === "production";
  const useMemoryRedis = source.E2E_USE_MEMORY_REDIS === "1" && !isProduction;

  const appOrigin = source.APP_ORIGIN
    ? requireUrl("APP_ORIGIN", source.APP_ORIGIN)
    : isProduction
      ? requireUrl("APP_ORIGIN", undefined)
      : "http://localhost:3000";

  if (isProduction && !appOrigin.startsWith("https://")) {
    throw new Error("APP_ORIGIN must use HTTPS in production");
  }

  if (useMemoryRedis) {
    return {
      redisUrl: "https://memory.invalid",
      redisToken: "test-only",
      appOrigin,
      useMemoryRedis,
    };
  }

  return {
    redisUrl: requireUrl(
      "UPSTASH_REDIS_REST_URL",
      source.UPSTASH_REDIS_REST_URL,
    ),
    redisToken:
      source.UPSTASH_REDIS_REST_TOKEN ??
      (() => {
        throw new Error(
          "Missing required environment variable: UPSTASH_REDIS_REST_TOKEN",
        );
      })(),
    appOrigin,
    useMemoryRedis,
  };
}

let cachedEnv: ServerEnv | undefined;

export function getServerEnv(): ServerEnv {
  cachedEnv ??= parseServerEnv(process.env);
  return cachedEnv;
}
