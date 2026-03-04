"use client";

import { useRef, useEffect } from "react";

const CLIPS = [
  {
    src: "/demo/clip-back.mp4",
    z: 0,
    x: -140,
    rotate: -8,
    scale: 0.85,
    opacity: 0.7,
  },
  {
    src: "/demo/clip-mid.mp4",
    z: 1,
    x: 115,
    rotate: 6,
    scale: 0.9,
    opacity: 0.8,
  },
  { src: "/demo/clip-front.mp4", z: 2, x: 0, rotate: 0, scale: 1, opacity: 1 },
] as const;

export function DemoShowcase() {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    videoRefs.current.forEach((v) => {
      if (!v) return;
      v.play().catch(() => {});
    });
  }, []);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ height: 780 }}
    >
      {CLIPS.map((clip, i) => (
        <div
          key={clip.src}
          className="absolute transition-transform duration-700"
          style={{
            zIndex: clip.z,
            transform: `translateX(${clip.x}px) rotate(${clip.rotate}deg) scale(${clip.scale})`,
            opacity: clip.opacity,
          }}
        >
          {/* Phone frame */}
          <div
            className="overflow-hidden rounded-[2rem] border-2 border-border/60 bg-black shadow-2xl"
            style={{ width: 380, aspectRatio: "9/16" }}
          >
            <video
              ref={(el) => {
                videoRefs.current[i] = el;
              }}
              src={clip.src}
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      ))}

      {/* Glow behind stack */}
      <div className="pointer-events-none absolute -inset-16 -z-10 rounded-full bg-primary/8 blur-3xl" />
    </div>
  );
}
