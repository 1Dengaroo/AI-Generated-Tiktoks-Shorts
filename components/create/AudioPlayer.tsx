"use client";

import { useEffect, useRef } from "react";

type AudioPlayerProps = {
  src: string;
  playbackRate?: number;
};

export function AudioPlayer({ src, playbackRate = 1 }: AudioPlayerProps) {
  const ref = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  return (
    <div className="rounded-lg border border-border/50 bg-card/50 p-3">
      <audio
        ref={ref}
        controls
        className="w-full"
        src={src}
        onPlay={(e) => {
          e.currentTarget.playbackRate = playbackRate;
        }}
      >
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}
