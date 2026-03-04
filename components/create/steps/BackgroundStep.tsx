"use client";

import { useEffect } from "react";
import { VideoThumbnail } from "@/components/create/VideoThumbnail";
import { useApi } from "@/hooks/useApi";
import { api } from "@/lib/api/endpoints";

type VideoItem = {
  name: string;
  url: string;
  previewUrl: string;
};

type BackgroundStepProps = {
  selectedUrl: string | null;
  onSelect: (url: string, previewUrl: string) => void;
};

export function BackgroundStep({ selectedUrl, onSelect }: BackgroundStepProps) {
  const {
    data,
    loading,
    execute: fetchVideos,
  } = useApi<{ videos: VideoItem[] }>(api.videos.list);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const videos = data?.videos ?? [];

  return (
    <div className="mx-auto max-w-5xl">
      <h2
        className="text-lg font-bold"
        style={{ fontFamily: "var(--font-bricolage)" }}
      >
        Background Video
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Select a gameplay clip for the background.
      </p>

      <div className="mt-6">
        {loading && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-video animate-pulse rounded-xl bg-muted"
              />
            ))}
          </div>
        )}

        {!loading && videos.length === 0 && (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No gameplay videos found.
          </p>
        )}

        {!loading && videos.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {videos.map((video) => (
              <VideoThumbnail
                key={video.url}
                name={video.name}
                previewUrl={video.previewUrl}
                selected={selectedUrl === video.url}
                onSelect={() => onSelect(video.url, video.previewUrl)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
