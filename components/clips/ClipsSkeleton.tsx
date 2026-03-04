"use client";

import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function ClipsSkeleton() {
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
        <SignInButton mode="modal">
          <Button size="sm">Sign in</Button>
        </SignInButton>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-border/40 bg-card/30"
          >
            <div className="aspect-[9/16] animate-pulse bg-muted/40" />
          </div>
        ))}
      </div>
    </>
  );
}
