"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/utils";
import { computeDurationInFrames } from "@/remotion/remotion.types";
import { api } from "@/lib/api/endpoints";
import type { VideoCompositionProps } from "@/components/create/create-wizard.types";

type FinishStepProps = VideoCompositionProps;

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 3,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
}) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="hsl(var(--border))"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="transition-[stroke-dashoffset] duration-500 ease-out"
      />
    </svg>
  );
}

export function FinishStep({
  backgroundVideoSrc,
  backgroundVideoStartFrom,
  titleNarrationSrc,
  titleNarrationDurationSec,
  narrationSrc,
  captions,
  durationSeconds,
  playbackRate,
  captionStyle,
  title,
  introConfig,
  backgroundAudio,
  narrationVolume,
}: FinishStepProps) {
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [fileName, setFileName] = useState(
    () => (title ?? "video").replace(/[^a-zA-Z0-9_\- ]/g, "").trim() || "video",
  );

  const [renderState, setRenderState] = useState<{
    status: "idle" | "rendering" | "done" | "error";
    progress: number;
    outputUrl: string | null;
    error: string | null;
  }>({ status: "idle", progress: 0, outputUrl: null, error: null });

  const { isSignedIn } = useAuth();

  const introDurationSec = introConfig.enabled
    ? (titleNarrationDurationSec + introConfig.pauseSec) / playbackRate
    : 0;
  const bodyDurationSec = durationSeconds / playbackRate;
  const totalDurationSec = introDurationSec + bodyDurationSec;
  const durationInFrames = computeDurationInFrames(
    introDurationSec,
    bodyDurationSec,
  );

  const handleDownload = useCallback(() => {
    if (!renderState.outputUrl) return;
    const name = `${fileName || "video"}.mp4`;
    const proxyUrl = `/api/download?url=${encodeURIComponent(renderState.outputUrl)}&name=${encodeURIComponent(name)}`;
    const a = document.createElement("a");
    a.href = proxyUrl;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setDownloadModalOpen(false);
  }, [renderState.outputUrl, fileName]);

  const pollInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, []);

  const startRender = useCallback(async () => {
    if (pollInterval.current) clearInterval(pollInterval.current);

    setRenderState({
      status: "rendering",
      progress: 0,
      outputUrl: null,
      error: null,
    });

    try {
      const { renderId, bucketName } = await api.render.start({
        compositionProps: {
          backgroundVideoSrc,
          backgroundVideoStartFrom,
          titleNarrationSrc,
          titleNarrationDurationSec,
          narrationSrc,
          captions,
          durationInFrames,
          playbackRate,
          captionStyle,
          title,
          introConfig,
          backgroundAudio,
          narrationVolume,
        },
      });

      pollInterval.current = setInterval(async () => {
        try {
          const { job } = await api.render.status(renderId, bucketName);

          if (job.status === "done") {
            if (pollInterval.current) clearInterval(pollInterval.current);
            setRenderState({
              status: "done",
              progress: 100,
              outputUrl: job.outputUrl,
              error: null,
            });
            if (job.outputUrl) {
              api.clips
                .save({ outputUrl: job.outputUrl, sourceBucket: bucketName })
                .catch(() => {});
            }
          } else if (job.status === "error") {
            if (pollInterval.current) clearInterval(pollInterval.current);
            setRenderState({
              status: "error",
              progress: 0,
              outputUrl: null,
              error: job.error,
            });
          } else {
            setRenderState((prev) => ({ ...prev, progress: job.progress }));
          }
        } catch {
          // polling error, keep trying
        }
      }, 2000);
    } catch (err) {
      setRenderState({
        status: "error",
        progress: 0,
        outputUrl: null,
        error: getErrorMessage(err, "Unknown error"),
      });
    }
  }, [
    backgroundVideoSrc,
    backgroundVideoStartFrom,
    titleNarrationSrc,
    titleNarrationDurationSec,
    narrationSrc,
    captions,
    durationInFrames,
    playbackRate,
    captionStyle,
    title,
    introConfig,
    backgroundAudio,
    narrationVolume,
  ]);

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      {/* ── Idle ── */}
      {renderState.status === "idle" && (
        <div className="flex flex-col items-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Export
          </p>

          <h2
            className="mt-3 text-center text-xl font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-bricolage)" }}
          >
            Your video is ready to render
          </h2>

          {/* Specs — quiet table layout */}
          <div className="mt-8 w-full max-w-xs">
            <div className="divide-y divide-border/40">
              {[
                ["Format", "H.264 MP4"],
                ["Resolution", "1080 × 1920"],
                ["Duration", formatDuration(totalDurationSec)],
                ["Speed", `${playbackRate}×`],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between py-2.5"
                >
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="text-xs font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 w-full max-w-xs">
            {isSignedIn ? (
              <Button
                onClick={startRender}
                size="lg"
                className="w-full text-[13px] font-medium tracking-wide transition-shadow hover:shadow-[0_0_24px_-6px_hsl(var(--primary)/0.4)]"
              >
                Export Video
              </Button>
            ) : (
              <SignInButton mode="modal">
                <Button
                  size="lg"
                  className="w-full text-[13px] font-medium tracking-wide"
                >
                  Sign in to Export
                </Button>
              </SignInButton>
            )}
          </div>
        </div>
      )}

      {/* ── Rendering ── */}
      {renderState.status === "rendering" && (
        <div className="flex flex-col items-center">
          <div className="relative">
            <ProgressRing progress={renderState.progress} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-semibold tabular-nums tracking-tight">
                {renderState.progress}
                <span className="text-sm font-normal text-muted-foreground">
                  %
                </span>
              </span>
            </div>
          </div>

          <p className="mt-6 text-sm font-medium tracking-tight">Rendering</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            This usually takes under a minute
          </p>
        </div>
      )}

      {/* ── Done ── */}
      {renderState.status === "done" && renderState.outputUrl && (
        <div className="flex flex-col items-center">
          <div className="flex size-10 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="oklch(0.65 0.18 155)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Complete
          </p>

          <h2
            className="mt-2 text-center text-xl font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-bricolage)" }}
          >
            Your video is ready
          </h2>

          <p className="mt-1.5 text-xs text-muted-foreground">
            Saved to your clips library
          </p>

          <div className="mt-8 w-full max-w-xs space-y-2.5">
            <Button
              size="lg"
              className="w-full text-[13px] font-medium tracking-wide transition-shadow hover:shadow-[0_0_24px_-6px_hsl(var(--primary)/0.4)]"
              onClick={() => setDownloadModalOpen(true)}
            >
              Download MP4
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={startRender}
                className="flex-1 text-xs"
              >
                Re-render
              </Button>
              <Button variant="outline" asChild className="flex-1 text-xs">
                <Link href="/clips">My Clips</Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {renderState.status === "error" && (
        <div className="flex flex-col items-center">
          <div className="flex size-10 items-center justify-center rounded-full border border-destructive/20 bg-destructive/10">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="hsl(var(--destructive))"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>

          <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.2em] text-destructive/80">
            Error
          </p>

          <h2
            className="mt-2 text-center text-xl font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-bricolage)" }}
          >
            Render failed
          </h2>

          <p className="mt-2 max-w-sm text-center text-xs text-muted-foreground">
            {renderState.error || "Something went wrong. Please try again."}
          </p>

          <div className="mt-8 w-full max-w-xs">
            <Button
              onClick={startRender}
              size="lg"
              className="w-full text-[13px] font-medium tracking-wide"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* ── Download dialog ── */}
      <Dialog open={downloadModalOpen} onOpenChange={setDownloadModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Name your file</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <Input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleDownload();
              }}
              autoFocus
            />
            <span className="shrink-0 rounded-md bg-muted px-2 py-1.5 font-mono text-xs text-muted-foreground">
              .mp4
            </span>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleDownload}>Download</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
