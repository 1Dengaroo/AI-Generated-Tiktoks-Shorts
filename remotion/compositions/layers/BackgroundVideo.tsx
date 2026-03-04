import { useState, useEffect } from "react";
import {
  OffthreadVideo,
  Loop,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  delayRender,
  continueRender,
} from "remotion";
import { getVideoMetadata } from "@remotion/media-utils";

type BackgroundVideoProps = {
  src: string;
  startFrom: number;
};

export function BackgroundVideo({ src, startFrom }: BackgroundVideoProps) {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const [loopDuration, setLoopDuration] = useState<number | null>(null);
  const [handle] = useState(() => delayRender("Fetching video metadata"));

  useEffect(() => {
    getVideoMetadata(src)
      .then((metadata) => {
        const videoFrames = Math.floor(metadata.durationInSeconds * fps);
        setLoopDuration(Math.max(videoFrames - startFrom, fps));
        continueRender(handle);
      })
      .catch(() => {
        // Fallback: don't loop, just play through
        setLoopDuration(durationInFrames);
        continueRender(handle);
      });
  }, [src, fps, startFrom, handle, durationInFrames]);

  const scale = interpolate(frame, [0, durationInFrames], [1, 1.05], {
    extrapolateRight: "clamp",
  });

  if (loopDuration === null) return null;

  return (
    <Loop durationInFrames={loopDuration} layout="none">
      <OffthreadVideo
        src={src}
        trimBefore={startFrom}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale})`,
        }}
        muted
      />
    </Loop>
  );
}
