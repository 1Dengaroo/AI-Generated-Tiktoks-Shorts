# r/Shorts

A full-stack web app that turns text prompts into short-form videos for TikTok, Reels, and YouTube Shorts. Paste a prompt, and the app generates a reddit-style story, narrates it with AI voices, syncs word-level captions, and renders the final video on AWS Lambda.

## How it works

1. **Story generation** -- GPT-4o turns a prompt into a structured, narrated story
2. **Voice synthesis** -- OpenAI TTS or ElevenLabs narrates the story with 12+ voice options
3. **Caption sync** -- Word-level captions are generated and aligned to the audio
4. **Preview** -- Real-time Remotion player lets you tweak captions, intros, playback speed, and background music
5. **Render** -- Remotion Lambda renders the final 1080x1920 MP4 on AWS, no local FFmpeg needed

## Tech stack

- **Framework:** Next.js 16 (App Router, React 19)
- **Auth:** Clerk
- **Video:** Remotion v4 with Lambda rendering
- **AI:** OpenAI (story + TTS), ElevenLabs (TTS)
- **Storage:** AWS S3 (videos, audio, renders)
- **Styling:** Tailwind CSS v4, shadcn/ui, custom theme system
- **Validation:** Zod
- **Language:** TypeScript (strict)

## Getting started

### Prerequisites

- Node.js 20+
- AWS account with S3 bucket and Lambda access
- OpenAI API key
- Clerk application
- ElevenLabs API key (optional, for additional voices)

### Setup

```bash
git clone <repo-url>
cd rshorts
npm install
cp .env.example .env
```

Fill in the values in `.env` (see `.env.example` for all required variables), then:

```bash
npm run dev
```

### Lambda deployment

To deploy the Remotion Lambda function and site bundle:

```bash
npx tsx scripts/deploy-lambda.ts
```

This prints `REMOTION_FUNCTION_NAME` and `REMOTION_SERVE_URL` values to add to your `.env`.

## Scripts

| Command                            | Description                                  |
| ---------------------------------- | -------------------------------------------- |
| `npm run dev`                      | Start development server                     |
| `npm run build`                    | Production build                             |
| `npm run lint`                     | Run ESLint                                   |
| `npm run remotion:studio`          | Open Remotion Studio for composition preview |
| `npx tsx scripts/deploy-lambda.ts` | Deploy Lambda function and site bundle       |

## Project structure

```
app/                    Next.js routes and API handlers
  api/                  REST endpoints (story, narration, captions, render, clips)
  clips/                Server-rendered clips gallery
  create/               Video creation wizard
components/             React components
  create/               Wizard steps (Story, Narration, Background, Preview, Finish)
  clips/                Clips page components
  ui/                   shadcn/ui primitives
hooks/                  Custom React hooks (useApi)
lib/                    Shared logic
  api/                  Axios client, typed endpoint functions, API types
  narration/            TTS types, voice config, audio effects
  story/                Story generation types and prompts
  captions/             Caption generation and processing
  render/               Lambda config and render types
  video/                S3 storage layer
remotion/               Video compositions and Remotion config
scripts/                Deployment and utility scripts
```
