### Typescript

- Avoid as — it often masks incorrect typing- Put all types in a <name>.types.ts file, unless scoped to a single component- Try reusing types as much as possible to avoid retyping everything

## Workflow Orchestration

### Plan Node Default

- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)- If something goes sideways, STOP and re-plan immediately – don't keep pushing- Use plan mode for verification steps, not just building- Write detailed specs upfront to reduce ambiguity

### Subagent Strategy

- Use subagents liberally to keep main context window clean- Offload research, exploration, and parallel analysis to subagents- For complex problems, throw more compute at it via subagents- One task per subagent for focused execution

### Verification Before Done

- Never mark a task complete without proving it works- Diff behavior between main and your changes when relevant- Ask yourself: "Would a staff engineer approve this?"- Run tests, check logs, demonstrate correctness

### Demand Elegance (Balanced)

- For non-trivial changes: pause and ask "is there a more elegant way?"- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"- Skip this for simple, obvious fixes – don't over-engineer- Challenge your own work before presenting it

### Autonomous Bug Fixing

- When given a bug report: just fix it. Don't ask for hand-holding- Point at logs, errors, failing tests – then resolve them- Zero context switching required from the user- Go fix failing CI tests without being told how

## Core Principles

- Simplicity First: Make every change as simple as possible. Impact minimal code.- No Laziness: Find root causes. No temporary fixes. Senior developer standards.- Minimal Impact: Changes should only touch what's necessary. Avoid introducing bugs.

## Remotion Rendering

- The app uses Remotion v4 with **Remotion Lambda** for rendering. All render compute runs on AWS Lambda — no local Chromium/FFmpeg.
- **Preview vs Render**: The `<Player>` preview uses live source code. Lambda renders use a deployed site bundle on S3 (`REMOTION_SERVE_URL`). After changing ANY file under `remotion/`, run `npx tsx scripts/deploy-lambda.ts` to redeploy the site bundle.
- Always use `OffthreadVideo` for video elements — never `Html5Video`. `Html5Video` causes choppy renders because it relies on Chrome's imprecise frame-by-frame seeking. `OffthreadVideo` uses FFmpeg for exact frame extraction.
- The Remotion bundler uses Webpack which does NOT resolve tsconfig `@/` aliases. The `webpackOverride` in `scripts/deploy-lambda.ts` handles this — don't remove it.
- **Lambda deployment**: Run `npx tsx scripts/deploy-lambda.ts` to deploy/update the Lambda function and site bundle. It prints env vars (`REMOTION_FUNCTION_NAME`, `REMOTION_SERVE_URL`) to add to `.env`.
- **No local render queue**: Render progress is tracked by Remotion Lambda in S3 via `getRenderProgress()`. There is no in-memory job queue.
- All S3 URLs (video, narration, audio) passed to the composition are presigned with 1-hour expiry. Keep this in mind when modifying the render pipeline.

## Guardrails
