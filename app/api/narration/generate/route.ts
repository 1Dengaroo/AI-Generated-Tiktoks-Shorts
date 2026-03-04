import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getOpenAIClient } from "@/lib/api/openai";
import { getElevenLabsClient } from "@/lib/api/elevenlabs";
import { s3Storage, downloadFromS3 } from "@/lib/video/storage";
import { narrationGenerateRequestSchema } from "@/lib/narration/narration-schema";
import {
  applyVoiceEffect,
  getAudioDuration,
} from "@/lib/narration/audio-effects";
import { expandAbbreviations } from "@/lib/narration/abbreviations";
import {
  ELEVENLABS_MODEL,
  ELEVENLABS_OUTPUT_FORMAT,
  DEFAULT_VOICE_ID,
  DEFAULT_PROVIDER,
} from "@/lib/narration/voices";
import { getErrorMessage } from "@/lib/utils";
import type { VoiceEffect, TtsProvider } from "@/lib/narration/narration.types";

const USE_STUB = process.env.NARRATION_USE_STUB === "true";
const STUB_TITLE_KEY = process.env.NARRATION_STUB_TITLE_KEY ?? "";
const STUB_BODY_KEY = process.env.NARRATION_STUB_BODY_KEY ?? "";

async function generateWithOpenAI(
  text: string,
  voiceId: string,
): Promise<Buffer> {
  const openai = getOpenAIClient();
  const response = await openai.audio.speech.create({
    model: "tts-1",
    voice: voiceId as "alloy" | "ash" | "coral" | "sage" | "echo" | "shimmer",
    input: text,
    response_format: "mp3",
  });
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function generateWithElevenLabs(
  text: string,
  voiceId: string,
): Promise<Buffer> {
  const elevenlabs = getElevenLabsClient();
  const audioStream = await elevenlabs.textToSpeech.convert(voiceId, {
    text,
    model_id: ELEVENLABS_MODEL,
    output_format: ELEVENLABS_OUTPUT_FORMAT,
  });
  const chunks: Uint8Array[] = [];
  for await (const chunk of audioStream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = narrationGenerateRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const voiceEffect: VoiceEffect = parsed.data.voiceEffect ?? "none";

    if (USE_STUB) {
      const stubKey =
        parsed.data.segment === "body" ? STUB_BODY_KEY : STUB_TITLE_KEY;
      const audioBuffer = await downloadFromS3(stubKey);
      const processed = await applyVoiceEffect(
        Buffer.from(audioBuffer),
        voiceEffect,
      );
      const key = `narrations/${uuidv4()}.mp3`;
      const [stored, durationSeconds] = await Promise.all([
        s3Storage.save(key, processed),
        getAudioDuration(processed),
      ]);
      return NextResponse.json({
        audioUrl: stored.url,
        audioKey: stored.path,
        durationSeconds,
      });
    }

    const { text, voiceId } = parsed.data;
    const provider: TtsProvider = parsed.data.provider ?? DEFAULT_PROVIDER;
    const narrationText = expandAbbreviations(text);
    const resolvedVoiceId = voiceId || DEFAULT_VOICE_ID;

    const rawBuffer =
      provider === "openai"
        ? await generateWithOpenAI(narrationText, resolvedVoiceId)
        : await generateWithElevenLabs(narrationText, resolvedVoiceId);

    const audioBuffer = await applyVoiceEffect(rawBuffer, voiceEffect);

    const key = `narrations/${uuidv4()}.mp3`;
    const [stored, durationSeconds] = await Promise.all([
      s3Storage.save(key, audioBuffer),
      getAudioDuration(audioBuffer),
    ]);

    return NextResponse.json({
      audioUrl: stored.url,
      audioKey: stored.path,
      durationSeconds,
    });
  } catch (err) {
    console.error("Narration generation error:", err);
    return NextResponse.json(
      { error: getErrorMessage(err, "Narration generation failed") },
      { status: 500 },
    );
  }
}
