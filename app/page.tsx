import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookOpen,
  Volume2,
  Type,
  Zap,
  Palette,
  Download,
} from "lucide-react";
import { Header } from "@/components/Header";
import { DemoShowcase } from "@/components/DemoShowcase";

const PIPELINE = [
  {
    icon: BookOpen,
    label: "Story",
    detail: "AI generates a viral reddit-style story from your prompt",
  },
  {
    icon: Volume2,
    label: "Narrate",
    detail: "Text-to-speech with 12+ voices and effects",
  },
  {
    icon: Type,
    label: "Caption",
    detail: "Word-level captions synced automatically",
  },
];

export default function Home() {
  return (
    <div className="grain-overlay relative flex min-h-screen flex-col bg-background text-foreground">
      <Header />

      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 pt-12 pb-24 lg:pt-20">
        {/* Hero area */}
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          {/* Left: copy */}
          <div className="flex flex-col gap-6">
            <div className="animate-fade-slide-up stagger-1">
              <span className="inline-block rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium tracking-wide text-primary">
                reddit stories &rarr; short-form video
              </span>
            </div>

            <h1
              className="animate-fade-slide-up stagger-2 text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-[1.05] tracking-tight"
              style={{ fontFamily: "var(--font-bricolage)" }}
            >
              Turn stories into
              <br />
              <span className="hero-gradient-text">viral shorts</span>
            </h1>

            <p className="animate-fade-slide-up stagger-3 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
              Paste a prompt. Get a fully narrated, captioned video ready for
              TikTok, Reels, and YouTube Shorts.
            </p>

            <div className="animate-fade-slide-up stagger-4 flex items-center gap-3">
              <Button
                asChild
                size="lg"
                className="group relative gap-2 text-sm font-semibold transition-shadow hover:shadow-[0_0_32px_-4px_hsl(var(--primary)/0.45)]"
              >
                <Link href="/create">
                  Start creating
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right: layered video showcase */}
          <div className="animate-fade-slide-up stagger-5 flex justify-center">
            <DemoShowcase />
          </div>
        </div>

        {/* Stats */}
        <div className="mt-24 flex justify-center lg:mt-32">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/40 px-5 py-2.5">
            <span
              className="text-lg font-bold text-primary sm:text-xl"
              style={{ fontFamily: "var(--font-bricolage)" }}
            >
              700+
            </span>
            <span className="text-sm text-muted-foreground">
              shorts created, rendered &amp; exported
            </span>
          </div>
        </div>

        {/* Features section */}
        <div className="mt-24 lg:mt-32">
          <div className="mx-auto max-w-2xl text-center">
            <h2
              className="text-2xl font-bold tracking-tight sm:text-3xl"
              style={{ fontFamily: "var(--font-bricolage)" }}
            >
              Everything you need to go viral
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              From idea to published short in under a minute.
            </p>
          </div>

          <div className="mt-12 grid gap-3 sm:grid-cols-3">
            {[
              {
                icon: Zap,
                title: "One-click render",
                desc: "Cloud rendering powered by AWS Lambda. No downloads, no waiting around.",
              },
              {
                icon: Palette,
                title: "Fully customizable",
                desc: "Title cards, caption styles, fonts, colors, playback speed — tweak everything.",
              },
              {
                icon: Download,
                title: "Export anywhere",
                desc: "Download in 1080x1920 and post directly to TikTok, Reels, or Shorts.",
              },
            ].map((feat) => (
              <div
                key={feat.title}
                className="flex items-start gap-4 rounded-xl border border-border/50 bg-card/40 p-5"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feat.icon className="size-4" />
                </div>
                <div>
                  <h3
                    className="text-sm font-bold"
                    style={{ fontFamily: "var(--font-bricolage)" }}
                  >
                    {feat.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {feat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline section */}
        <div className="animate-fade-slide-up stagger-6 mt-20 lg:mt-28">
          <h2 className="mb-8 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            The pipeline
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {PIPELINE.map((item, i) => (
              <div
                key={item.label}
                className="group relative rounded-xl border border-border/50 bg-card/40 p-5 transition-colors hover:border-primary/30 hover:bg-card/70"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <item.icon className="size-4" />
                  </div>
                  <span className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground/50">
                    0{i + 1}
                  </span>
                </div>
                <h3
                  className="text-sm font-bold"
                  style={{ fontFamily: "var(--font-bricolage)" }}
                >
                  {item.label}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* CTA Footer */}
      <footer className="relative z-10 border-t border-border/50 bg-card/30">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-6 py-16 text-center">
          <h2
            className="text-xl font-bold tracking-tight sm:text-2xl"
            style={{ fontFamily: "var(--font-bricolage)" }}
          >
            Ready to make your first short?
          </h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Go from idea to a fully narrated, captioned video in under a minute.
            No editing skills needed.
          </p>
          <Button
            asChild
            size="lg"
            className="group mt-2 gap-2 text-sm font-semibold transition-shadow hover:shadow-[0_0_32px_-4px_hsl(var(--primary)/0.45)]"
          >
            <Link href="/create">
              Start creating
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
          <p className="mt-6 text-xs text-muted-foreground/60">
            &copy; {new Date().getFullYear()} Andy Deng. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Background gradient layers */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* Top: primary glow from above */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-15%,hsl(var(--primary)/0.18)_0%,transparent_55%)]" />
        {/* Mid-left blob */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_700px_at_5%_55%,hsl(var(--primary)/0.12)_0%,transparent_65%)]" />
        {/* Mid-right blob */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_600px_at_95%_35%,hsl(var(--primary)/0.12)_0%,transparent_65%)]" />
        {/* Bottom uplighting */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_35%_at_50%_110%,hsl(var(--primary)/0.15)_0%,transparent_55%)]" />
      </div>
    </div>
  );
}
