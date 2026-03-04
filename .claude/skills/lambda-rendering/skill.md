---
name: lambda-rendering
description: Explain the Remotion Lambda rendering pipeline, concurrency constraints, and what to change when the AWS concurrency quota increases. Use when working on render infrastructure, debugging render failures, or planning render scaling.
---

# Remotion Lambda Rendering Pipeline

## Architecture Overview

Rendering runs entirely on AWS Lambda via Remotion Lambda v4. There is no local Chromium/FFmpeg and no in-memory job queue. Render state lives in S3 and is queried via `getRenderProgress()`.

### Key Files

| File | Role |
|------|------|
| `scripts/deploy-lambda.ts` | Deploys Lambda function + site bundle to S3 |
| `lib/render/lambda-config.ts` | Reads `REMOTION_AWS_REGION`, `REMOTION_FUNCTION_NAME`, `REMOTION_SERVE_URL` from env |
| `lib/render/render-schema.ts` | Zod validation for render request (must match `StoryVideoProps`) |
| `lib/render/render.types.ts` | `RenderJob`, `RenderStatus`, `RenderStatusResponse` types |
| `lib/api/endpoints.ts` | Typed client-side API functions: `api.render.start()`, `api.render.status()` |
| `app/api/render/route.ts` | POST - starts render via `renderMediaOnLambda()`, outputs to `renders/${userId}/${uuid}.mp4` |
| `app/api/render/[jobId]/route.ts` | GET - polls progress via `getRenderProgress()` |
| `components/create/steps/FinishStep.tsx` | Client-side UI: triggers render, polls progress, shows download. Uses `api.render.*` and `api.clips.save()` |

## Client-Side API Layer

FinishStep uses the centralized API client (`lib/api/endpoints.ts`) instead of raw `fetch()`:
- `api.render.start({ compositionProps })` — POST to start render, returns `{ renderId, bucketName }`
- `api.render.status(renderId, bucketName)` — GET to poll progress, returns `{ job: RenderJob }`
- `api.clips.save({ outputUrl, sourceBucket })` — fire-and-forget POST to save completed clip to user's S3 library

## How a Render Works

```
Client (FinishStep)
  |
  | api.render.start({ compositionProps })  →  POST /api/render
  v
API Route (render/route.ts)
  |
  | renderMediaOnLambda({ outName: "${userId}/${uuid}.mp4", ... })
  v
AWS Lambda (Orchestrator)
  |
  | Spawns N chunk-renderer Lambdas (Remotion default chunking)
  | Each chunk renders its frame range to S3
  | Orchestrator concatenates chunks into final MP4
  v
S3 (output MP4 + progress metadata)
  ^
  | getRenderProgress({ renderId, bucketName })
  |
API Route (render/[jobId]/route.ts)
  ^
  | api.render.status(renderId, bucketName)  →  GET /api/render/{renderId}?bucketName=...
  |
Client (polls every 2s)
  |
  | On completion: api.clips.save({ outputUrl, sourceBucket })  (fire-and-forget)
```

### Lambda Invocation Breakdown

A single render uses these concurrent Lambda invocations:
1. **1 Orchestrator** - coordinates chunks, concatenates output
2. **N Chunk Renderers** - Remotion's default chunking (~20 frames/lambda)
3. **Progress polling** - each `getRenderProgress()` call invokes the Lambda

Total concurrent invocations at peak = 1 (orchestrator) + N (chunks) + 1 (progress poll)

## Current Concurrency Constraints

**AWS concurrency limit: 10**

This is the account-level concurrent Lambda execution limit in `us-east-2`. All Remotion Lambda invocations (orchestrator + chunks + progress) share this pool.

### Current Mitigations

1. **Rate-limit graceful degradation** (`render/[jobId]/route.ts`): If `getRenderProgress()` throws `TooManyRequestsException` / `Rate Exceeded` / `ConcurrentInvocationLimitExceeded`, the API returns a fake `{ status: "rendering", progress: 0 }` response instead of a 500 error. The client retries on the next poll cycle.

2. **High timeout** (`deploy-lambda.ts`): Lambda timeout set to **900s** (15 min) to handle cases where few concurrent chunks must each process more frames.

### Lambda Deploy Config

```typescript
// scripts/deploy-lambda.ts
REGION = "us-east-2"
MEMORY_SIZE = 2048    // MB
DISK_SIZE = 2048      // MB
TIMEOUT = 900         // seconds (15 min)
```

Changing these requires redeploying: `npx tsx scripts/deploy-lambda.ts`

## TODOs When Concurrency Increases

When the AWS concurrency quota is increased (recommended: 200+), make these changes:

### 1. Reduce Lambda timeout
**File:** `scripts/deploy-lambda.ts`

With more parallelism, each chunk finishes much faster. Drop timeout back to 240s:
```diff
- const TIMEOUT = 900;
+ const TIMEOUT = 240;
```

Then redeploy: `npx tsx scripts/deploy-lambda.ts`

### 2. Speed up polling interval (optional)
**File:** `components/create/steps/FinishStep.tsx`

Currently polls every 2s. Change to 1s for snappier progress:
```diff
- }, 2000);
+ }, 1000);
```

### 3. Remove rate-limit graceful degradation (optional)
**File:** `app/api/render/[jobId]/route.ts`

The `isRateLimit` check can be removed once rate limits are no longer hit. However, keeping it as a safety net is harmless and costs nothing.

### 4. Consider concurrent renders
With 200+ concurrency, multiple users could render simultaneously. Currently there's no queue or limit on concurrent renders - a single render with default chunking could use ~50+ Lambdas. If supporting multiple simultaneous users, consider:
- Setting an explicit `framesPerLambda` that balances speed vs concurrency budget
- Adding a render queue to limit concurrent renders

## Debugging Renders

- **Render never starts:** Check `REMOTION_FUNCTION_NAME` and `REMOTION_SERVE_URL` env vars. Run `npx tsx scripts/deploy-lambda.ts` if the site bundle is stale.
- **Chunks timeout:** Each chunk is rendering too many frames. Set explicit `framesPerLambda` in `renderMediaOnLambda()` or increase `TIMEOUT`.
- **Progress always 0:** Rate limiting is silently returning fake progress. Check CloudWatch logs for `TooManyRequestsException`.
- **Output URL expired:** S3 presigned URLs expire in 1 hour. Re-poll progress to get a fresh URL.
- **Composition mismatch:** If you changed files under `remotion/`, redeploy the site bundle. Lambda renders use the S3 bundle, not live source code.
- **Clip not appearing:** `api.clips.save()` is fire-and-forget. Check `app/api/clips/save/route.ts` logs if clips don't show up on the clips page.
