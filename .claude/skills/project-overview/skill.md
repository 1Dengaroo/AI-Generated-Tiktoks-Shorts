---
name: project-overview
description: Explain the r/Shorts project structure, architecture, data flow, and gotchas. Use when the user asks about how the project works, where things are, or needs orientation on the codebase.
---

# r/Shorts — Project Overview

r/Shorts is a full-stack Next.js app that generates viral short-form videos (TikTok/Reels/Shorts, 9:16 vertical). Users go through a 4-step wizard: generate a story, narrate it, pick a background video, then preview and render an MP4.

## Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- **Video:** Remotion v4 (composition, player, renderer)
- **AI:** OpenAI GPT-4o-mini (stories), OpenAI Whisper (captions), ElevenLabs (TTS)
- **Storage:** AWS S3 (audio, video, renders)
- **Themes:** 7 themes via next-themes + CSS custom properties

## Directory Map

```
app/
├── page.tsx                       Landing page
├── layout.tsx                     Root layout (fonts, ThemeProvider)
├── create/page.tsx                Video creation wizard page
└── api/
    ├── story/generate/route.ts    POST — GPT-4o-mini story generation
    ├── narration/generate/route.ts POST — ElevenLabs TTS (title + body, two calls)
    ├── captions/generate/route.ts POST — Whisper word-level transcription
    ├── render/route.ts            POST — Start async Remotion render job
    ├── render/[jobId]/route.ts    GET  — Poll render progress
    └── videos/route.ts            GET  — List S3 background videos

components/
├── ui/                            shadcn/ui primitives (button, card, select, slider, etc.)
├── theme-switcher.tsx             Theme + font picker (7 themes, 5 fonts)
└── create/
    ├── CreateWizard.tsx           Main orchestrator — owns all wizard state
    ├── create-wizard.types.ts     WizardState, WizardStep types
    ├── CaptionStylePanel.tsx      Left sidebar: intro, caption, effect controls
    ├── AudioPlayer.tsx            HTML audio wrapper with playback rate
    ├── RenderProgress.tsx         Render status + download link
    ├── VideoThumbnail.tsx         Background video selector card
    ├── StoryEditor.tsx            Textarea for editing story text
    └── steps/
        ├── StoryStep.tsx          Step 1: prompt → story generation
        ├── NarrationStep.tsx      Step 2: voice + speed → TTS (two parallel calls)
        ├── BackgroundStep.tsx     Step 3: pick background gameplay video
        └── PreviewStep.tsx        Step 4: Remotion Player + render to MP4

lib/
├── utils.ts                       cn() — clsx + tailwind-merge
├── api/
│   ├── openai.ts                  Singleton OpenAI client
│   └── elevenlabs.ts              Singleton ElevenLabs client
├── story/
│   ├── story.types.ts             GeneratedStory, StorySegment
│   └── story-schema.ts            Zod: prompt, tone, maxDurationSeconds
├── narration/
│   ├── narration.types.ts         Voice, NarrationResult (title + body audio)
│   ├── narration-schema.ts        Zod: text (1-5000), voiceId
│   └── voices.ts                  6 ElevenLabs voices (3F, 3M), DEFAULT_VOICE
├── captions/
│   ├── captions.types.ts          CaptionsGenerateRequest/Response
│   └── captions-schema.ts         Zod: audioKey
├── render/
│   ├── render-schema.ts           Zod: full StoryVideoProps validation
│   ├── render.types.ts            RenderJob, RenderStatus, RenderStatusResponse
│   └── lambda-config.ts           Reads REMOTION_* env vars for Lambda rendering
├── video/
│   ├── storage.ts                 S3 ops: save, list, presign, download, upload
│   └── storage.types.ts           StoredFile, VideoStorageProvider
└── theme/
    ├── theme-registry.ts          7 themes, 5 fonts, DEFAULT_THEME="parsely"
    ├── theme-registry.types.ts    ThemeDefinition, ThemeId, FontDefinition
    └── theme-provider.tsx         next-themes wrapper + DarkClassManager

remotion/
├── index.ts                       Entry point for Remotion bundler
├── Root.tsx                       Composition registration (1080x1920, 30fps)
├── remotion.types.ts              ALL video types: StoryVideoProps, CaptionStyle, IntroConfig, transitions
├── load-fonts.ts                  Lazy Google font loader for captions
└── compositions/
    ├── StoryVideo.tsx             Main composition — orchestrates all layers
    └── layers/
        ├── BackgroundVideo.tsx    OffthreadVideo with Ken Burns zoom (1.0→1.05)
        ├── NarrationAudio.tsx     <Audio> wrapper with playbackRate
        ├── TitleCard.tsx          Reddit-style title card with transition animations
        └── CaptionOverlay.tsx     Word-level captions (2 words/group) with transitions

scripts/
├── bundle-remotion.ts             Bundle composition to .remotion-bundle/
├── generate-previews.ts           ffmpeg: 10s preview clips from gameplay videos
├── split-video.sh                 Legacy: chunk large videos
└── upload-chunks.sh               Legacy: upload chunks to S3
```

## Data Flow

```
Story Generation
  User prompt → POST /api/story/generate → GPT-4o-mini → { title, fullText, segments }

Narration (two parallel calls)
  title text → POST /api/narration/generate → ElevenLabs → titleAudioUrl + titleDuration
  body text  → POST /api/narration/generate → ElevenLabs → bodyAudioUrl + bodyDuration

Caption Generation (auto-triggered from body audio)
  bodyAudioKey → POST /api/captions/generate → Whisper → CaptionWord[] (word, start, end)
  NOTE: Captions are body-only. Timestamps start from 0 relative to body audio.

Preview
  All props → Remotion <Player> → live preview at 1080x1920

Render (Remotion Lambda)
  POST /api/render → renderMediaOnLambda() → { renderId, bucketName }
  Poll GET /api/render/{renderId}?bucketName=... every 5s → getRenderProgress() → outputUrl
```

## Video Composition Architecture

`StoryVideo.tsx` orchestrates layers in this order:

1. **BackgroundVideo** — stretched gameplay with subtle zoom
2. **Title Audio** — `<Sequence durationInFrames={titleEndFrame}>` (only during intro)
3. **Body Audio** — `<Sequence from={introEndFrame}>` (after intro + pause)
4. **TitleCard** — Reddit-style card with configurable transitions
5. **CaptionOverlay** — 2-word groups synced to body audio

### Time System (critical to understand)

There are two time domains:

- **Audio time** — seconds in the audio file at 1x speed
- **Display time** — seconds of video playback (= audioTime / playbackRate)

Key conversion: `scaleTime(t) = t / playbackRate` and `toFrame(audioSec) = (audioSec / playbackRate) * fps`

The intro timing:
```
introEndTimeSec = titleNarrationDurationSec + pauseSec   (audio-time convention)
introEndFrame   = toFrame(introEndTimeSec)                (display frames)
```

CaptionOverlay offsets all timing by `bodyStartDisplay = scaleTime(introEndTimeSec)` because caption timestamps are relative to body audio (start from 0), not the full video timeline.

## Two-Audio Architecture

Narration uses TWO separate ElevenLabs calls:

1. **Title audio** — just `story.title` → plays during title card
2. **Body audio** — just `story.fullText` → plays after intro + pause

This gives a real silence gap during `pauseSec` and keeps captions perfectly synced (body captions start from 0, body audio starts from 0 in its Sequence).

The stub system (`USE_STUB = true` in narration route) alternates between two pre-recorded files using a `stubCallIndex` counter — first call returns title stub, second returns body stub.

## Transition System

### Title Card Transitions
Types: `fade | slide-up | slide-down | scale | none`
- Configurable duration (0.1–2s)
- Both entrance AND exit animations (e.g. slide-up enters from +100px, exits to -60px)
- Applied as opacity on outer wrapper + transform on inner card

### Caption Transitions
Types: `fade | slide-up | squish | none`
- Configurable duration (0.1–1s)
- Applied per word-group (2 words)
- Squish: scaleY 0→1 + scaleX 1.4→1 (pop-in effect)

Both configured via `TransitionConfig = { type, durationSec }` embedded in `IntroConfig.transition` and `CaptionStyle.transition`.

## Wizard State Shape

```typescript
WizardState = {
  step: "story" | "narration" | "background" | "preview"
  story: GeneratedStory | null
  voiceId: string
  playbackRate: number
  titleAudioUrl: string | null       // ElevenLabs title audio
  titleAudioDuration: number | null  // seconds
  narrationUrl: string | null        // ElevenLabs body audio
  narrationKey: string | null        // S3 key for caption generation
  narrationDuration: number | null   // seconds
  captions: CaptionWord[]            // body-only, timestamps from 0
  backgroundVideoUrl: string | null
  backgroundPreviewUrl: string | null
  backgroundVideoStartFrom: number   // random offset into gameplay video
  captionStyle: CaptionStyle         // placement, font, highlight, stroke, transition
  introConfig: IntroConfig           // enabled, pauseSec, transition
}
```

State is ephemeral (no localStorage). Resets on page refresh.

## Important Gotchas

### Stub Mode
`USE_STUB` in `/app/api/narration/generate/route.ts` skips ElevenLabs. Uses `stubCallIndex % 2` to alternate title/body stubs. Reset counter by restarting the dev server if it gets out of sync.

### NarrationAudio uses `<Audio>` not `<Video>`
Originally used Remotion's `Html5Video` for audio playback. Now uses `<Audio>` from remotion. If you see `Html5Video` references elsewhere, they're stale.

### Lambda Concurrency Limit is 10
AWS concurrency in `us-east-2` is only 10. `framesPerLambda` is throttled to cap chunks at 6, poll interval is 5s, and rate-limit errors are gracefully handled. See the `lambda-rendering` skill for full details and TODOs for when the quota increases.

### S3 Presigned URLs Expire in 1 Hour
All `audioUrl`, `backgroundVideoUrl`, and `outputUrl` values expire. Long sessions may hit expired URLs.

### Duration Estimation is Approximate
`durationSeconds = Math.round(audioBuffer.length / 16000)` assumes 128kbps MP3. Off by a few seconds for variable bitrate files.

### Remotion Site Bundle Must Be Deployed
Lambda renders use a site bundle on S3 (`REMOTION_SERVE_URL`), not local code. After changing files under `remotion/`, run `npx tsx scripts/deploy-lambda.ts` to redeploy.

### Caption Timestamp Domain
Captions are generated from body audio ONLY. Their timestamps start from 0. CaptionOverlay applies `bodyTimeSec = currentTimeSec - bodyStartDisplay` to offset into the correct time domain. If you change how intro timing works, caption sync WILL break.

### pauseSec is in Audio-Time Convention
`introConfig.pauseSec` gets divided by `playbackRate` when converted to display time via `scaleTime()`. A `pauseSec=1` at `playbackRate=1.5` shows as ~0.67s of actual silence. This is the existing convention — changing it would require updating all timing code.

### Zod Schemas Must Match Types
`lib/render/render-schema.ts` validates the exact shape sent to the render API. If you add fields to `StoryVideoProps`, you MUST update the Zod schema or renders will fail validation.

### next.config.ts Server Externals
Remotion packages (`@remotion/renderer`, `@remotion/bundler`) are marked as `serverExternalPackages`. Removing this breaks server-side rendering.

## Environment Variables

```
OPENAI_API_KEY          — GPT-4o-mini + Whisper
ELEVENLABS_API_KEY      — Text-to-speech
AWS_REGION              — S3 region
AWS_S3_BUCKET           — S3 bucket name
AWS_ACCESS_KEY_ID       — S3 credentials
AWS_SECRET_ACCESS_KEY   — S3 credentials
```
