"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Download,
  Film,
  Grid2X2,
  Grid3X3,
  LayoutGrid,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StoredFile } from "@/lib/video/storage.types";

type GridLayout = "small" | "medium" | "large";

const gridConfig: Record<
  GridLayout,
  { className: string; icon: React.ReactNode }
> = {
  small: {
    className: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
    icon: <Grid3X3 className="size-3.5" />,
  },
  medium: {
    className: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    icon: <Grid2X2 className="size-3.5" />,
  },
  large: {
    className: "grid-cols-1 sm:grid-cols-2",
    icon: <LayoutGrid className="size-3.5" />,
  },
};

type ClipsGridProps = {
  clips: StoredFile[];
};

export function ClipsGrid({ clips }: ClipsGridProps) {
  const [gridLayout, setGridLayout] = useState<GridLayout>("medium");

  return (
    <>
      <div className="flex items-end justify-between">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight sm:text-3xl"
            style={{ fontFamily: "var(--font-bricolage)" }}
          >
            Your Clips
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Rendered videos appear here. New clips may take a few minutes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border border-border/50 bg-card/50">
            {(Object.keys(gridConfig) as GridLayout[]).map((layout) => (
              <button
                key={layout}
                onClick={() => setGridLayout(layout)}
                className={`p-1.5 transition-colors ${
                  gridLayout === layout
                    ? "bg-foreground/10 text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {gridConfig[layout].icon}
              </button>
            ))}
          </div>
          <Button asChild size="sm">
            <Link href="/create">
              <Plus className="size-3.5" />
              New video
            </Link>
          </Button>
        </div>
      </div>

      {clips.length === 0 && (
        <div className="mt-20 flex flex-col items-center gap-5 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl border border-border/50 bg-card/50">
            <Film className="size-7 text-muted-foreground/40" />
          </div>
          <div>
            <p className="font-semibold">No clips yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first video and it&apos;ll show up here.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/create">
              <Plus className="size-3.5" />
              Create a video
            </Link>
          </Button>
        </div>
      )}

      {clips.length > 0 && (
        <div className={`mt-6 grid gap-3 ${gridConfig[gridLayout].className}`}>
          {clips.map((clip) => (
            <div
              key={clip.path}
              className="group relative overflow-hidden rounded-xl border border-border/40 bg-card/30 transition-colors hover:border-primary/30"
            >
              <div className="relative aspect-[9/16]">
                <video
                  src={clip.url}
                  className="h-full w-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                  onMouseEnter={(e) => e.currentTarget.play()}
                  onMouseLeave={(e) => {
                    e.currentTarget.pause();
                    e.currentTarget.currentTime = 0;
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 flex justify-end p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="size-8 p-0"
                    asChild
                  >
                    <a
                      href={`/api/download?url=${encodeURIComponent(clip.url)}&name=${encodeURIComponent(clip.name)}`}
                      download={clip.name}
                    >
                      <Download className="size-3.5" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
