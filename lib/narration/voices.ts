import type { TtsProvider, Voice } from "./narration.types";

export const ELEVENLABS_MODEL = "eleven_turbo_v2_5";
export const ELEVENLABS_OUTPUT_FORMAT = "mp3_44100_128";

export const DEFAULT_PROVIDER: TtsProvider = "openai";
export const DEFAULT_VOICE_ID = "alloy";

export const voices: Voice[] = [
  // OpenAI TTS voices
  { id: "alloy", name: "Alloy", gender: "male", provider: "openai" },
  { id: "ash", name: "Ash", gender: "male", provider: "openai" },
  { id: "coral", name: "Coral", gender: "female", provider: "openai" },
  { id: "sage", name: "Sage", gender: "female", provider: "openai" },
  { id: "echo", name: "Echo", gender: "male", provider: "openai" },
  { id: "shimmer", name: "Shimmer", gender: "female", provider: "openai" },

  // ElevenLabs voices
  {
    id: "ErXwobaYiN019PkySvjV",
    name: "Antoni",
    gender: "male",
    provider: "elevenlabs",
  },
];

export const DEFAULT_VOICE = voices[0];
