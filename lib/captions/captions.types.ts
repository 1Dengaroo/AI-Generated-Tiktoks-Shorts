import type { CaptionWord } from "@/remotion/remotion.types";

export type CaptionsGenerateRequest = {
  audioKey: string;
};

export type CaptionsGenerateResponse = {
  words: CaptionWord[];
};
