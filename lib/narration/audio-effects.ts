import { v4 as uuidv4 } from "uuid";
import { execFile } from "child_process";
import { writeFile, readFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import type { VoiceEffect } from "./narration.types";

const VOICE_EFFECT_FILTERS: Record<string, string> = {
  anonymous: "rubberband=pitch=0.85,lowpass=f=4500",
};

export function applyVoiceEffect(
  inputBuffer: Buffer,
  effect: VoiceEffect,
): Promise<Buffer> {
  if (effect === "none") return Promise.resolve(inputBuffer);

  const id = uuidv4();
  const inputPath = join(tmpdir(), `narration-in-${id}.mp3`);
  const outputPath = join(tmpdir(), `narration-out-${id}.mp3`);

  return new Promise(async (resolve, reject) => {
    await writeFile(inputPath, inputBuffer);

    execFile(
      "ffmpeg",
      [
        "-y",
        "-i",
        inputPath,
        "-af",
        VOICE_EFFECT_FILTERS[effect],
        "-b:a",
        "128k",
        outputPath,
      ],
      async (error) => {
        try {
          if (error) return reject(error);
          const output = await readFile(outputPath);
          resolve(output);
        } catch (err) {
          reject(err);
        } finally {
          unlink(inputPath).catch(() => {});
          unlink(outputPath).catch(() => {});
        }
      },
    );
  });
}

export async function getAudioDuration(buffer: Buffer): Promise<number> {
  const { parseBuffer } = await import("music-metadata");
  const metadata = await parseBuffer(new Uint8Array(buffer), {
    mimeType: "audio/mpeg",
  });
  const duration = metadata.format.duration;
  if (duration === undefined) {
    throw new Error("Could not determine audio duration");
  }
  return duration;
}
