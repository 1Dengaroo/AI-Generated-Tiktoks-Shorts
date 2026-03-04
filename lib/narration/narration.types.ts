export type TtsProvider = "openai" | "elevenlabs";

export type Voice = {
  id: string;
  name: string;
  gender: "female" | "male";
  provider: TtsProvider;
};

export type VoiceEffect = "none" | "anonymous";

export type NarrationGenerateRequest = {
  text: string;
  voiceId?: string;
  voiceEffect?: VoiceEffect;
  provider?: TtsProvider;
  segment?: "title" | "body";
};

export type NarrationGenerateResponse = {
  audioUrl: string;
  audioKey: string;
  durationSeconds: number;
};

export type NarrationResult = {
  titleAudioUrl: string;
  titleAudioKey: string;
  titleDurationSec: number;
  bodyAudioUrl: string;
  bodyAudioKey: string;
  bodyDurationSec: number;
};
