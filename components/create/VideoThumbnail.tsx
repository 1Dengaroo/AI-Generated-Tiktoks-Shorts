"use client";

import { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

type VideoThumbnailProps = {
  name: string;
  previewUrl: string;
  selected: boolean;
  onSelect: () => void;
};

export function VideoThumbnail({
  name,
  previewUrl,
  selected,
  onSelect,
}: VideoThumbnailProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  const handleMouseEnter = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => {});
  }, []);

  const handleMouseLeave = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  }, []);

  const handleEnded = useCallback(() => {
    const video = videoRef.current;
    if (video) video.currentTime = 0;
  }, []);

  return (
    <button
      onClick={onSelect}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "group relative overflow-hidden rounded-xl border-2 transition-all hover:scale-[1.02] hover:shadow-lg",
        selected
          ? "border-primary shadow-[0_0_16px_-4px_hsl(var(--primary)/0.4)]"
          : "border-border/50 hover:border-primary/50",
      )}
    >
      {!videoReady && (
        <div className="aspect-video w-full animate-pulse bg-muted" />
      )}
      <video
        ref={videoRef}
        src={previewUrl}
        className={cn(
          "aspect-video w-full object-cover",
          videoReady ? "block" : "hidden",
        )}
        muted
        playsInline
        preload="metadata"
        onLoadedData={() => setVideoReady(true)}
        onEnded={handleEnded}
      />

      {selected && (
        <div className="absolute inset-0 flex items-center justify-center bg-primary/10 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="size-4" />
          </div>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 opacity-0 transition-opacity group-hover:opacity-100">
        <p className="truncate text-xs font-medium text-white">{name}</p>
      </div>
    </button>
  );
}
