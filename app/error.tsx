"use client";

import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center px-6">
        <p className="text-6xl font-bold text-muted-foreground/20">500</p>
        <h1
          className="mt-4 text-xl font-bold"
          style={{ fontFamily: "var(--font-bricolage)" }}
        >
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          An unexpected error occurred. Please try again.
        </p>
        <Button variant="outline" size="sm" className="mt-6" onClick={reset}>
          <RotateCw className="size-3.5" />
          Try again
        </Button>
      </main>
    </div>
  );
}
