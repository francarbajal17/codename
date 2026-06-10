# Environment Contract

## Required Server Variables

| Variable | Scope | Required | Description |
|----------|-------|----------|-------------|
| `UPSTASH_REDIS_REST_URL` | Server only | Yes | HTTPS endpoint for the Upstash Redis database |
| `UPSTASH_REDIS_REST_TOKEN` | Server only | Yes | Credential for the Upstash Redis REST API |

Neither variable may use the `NEXT_PUBLIC_` prefix or be imported by Client Components.

## Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_ORIGIN` | `http://localhost:3000` in local development | Canonical absolute origin used when producing the leader URL; required in production |

`APP_ORIGIN` MUST be an absolute `https://` URL in production. Local development may default to
`http://localhost:3000`. QR generation MUST NOT derive the production origin from request host
headers.

## Constants Kept in Code

| Constant | Value | Reason |
|----------|-------|--------|
| Game TTL | `86400` seconds | Product rule, not environment-specific configuration |
| Redis key prefix | `codename:game:` | Stable namespacing |
| Token entropy | 32 bytes | Security invariant |
| Board size | 25 | Game invariant |

Keeping these values in typed code prevents deployment configuration from silently changing product
behavior.

## Validation Behavior

- Environment parsing happens only in server modules.
- Missing or malformed required variables, including production `APP_ORIGIN`, fail fast with variable
  names but never credential values.
- Production startup/build validation must catch absent Redis configuration before traffic is served.
- Test configuration may inject a fake persistence client and must not require real production
  credentials for pure unit tests.

## Local File

Use `.env.local`, which remains uncommitted:

```dotenv
UPSTASH_REDIS_REST_URL=https://example.upstash.io
UPSTASH_REDIS_REST_TOKEN=replace-with-local-development-token
APP_ORIGIN=http://localhost:3000
```

Provide `.env.example` with empty placeholders and no secrets.

## Vercel

- Configure variables separately for Development, Preview, and Production.
- Prefer separate Preview and Production Upstash databases.
- The Vercel Marketplace integration may inject the two Upstash variables automatically.
- Set `APP_ORIGIN` to the exact HTTPS origin for each Preview and Production deployment.
