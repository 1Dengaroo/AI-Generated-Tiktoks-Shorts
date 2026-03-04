import { NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/api/openai";
import { captionsGenerateRequestSchema } from "@/lib/captions/captions-schema";
import { downloadFromS3 } from "@/lib/video/storage";
import { mergeWordsWithPunctuation } from "@/lib/captions/merge-punctuation";
import { getErrorMessage } from "@/lib/utils";
import type { CaptionsGenerateResponse } from "@/lib/captions/captions.types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = captionsGenerateRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const { audioKey } = parsed.data;

    const fileBuffer = await downloadFromS3(audioKey);
    const filename = audioKey.split("/").pop() || "audio.mp3";
    const file = new File([new Uint8Array(fileBuffer)], filename, {
      type: "audio/mpeg",
    });

    const openai = getOpenAIClient();

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
      response_format: "verbose_json",
      timestamp_granularities: ["word"],
    });

    const raw = transcription as unknown as {
      text: string;
      words: { word: string; start: number; end: number }[];
    };

    const words = mergeWordsWithPunctuation(
      raw.words.map((w) => ({ word: w.word, start: w.start, end: w.end })),
      raw.text,
    );

    return NextResponse.json({ words } satisfies CaptionsGenerateResponse);
  } catch (err) {
    console.error("Caption generation error:", err);
    return NextResponse.json(
      { error: getErrorMessage(err, "Caption generation failed") },
      { status: 500 },
    );
  }
}
