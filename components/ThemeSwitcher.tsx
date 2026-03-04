"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Settings } from "lucide-react";
import { themes, fonts, DEFAULT_FONT } from "@/lib/theme/theme-registry";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const FONT_STORAGE_KEY = "font";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

function getStoredFontId(): string {
  if (typeof window === "undefined") return DEFAULT_FONT.id;
  return localStorage.getItem(FONT_STORAGE_KEY) ?? DEFAULT_FONT.id;
}

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [fontId, setFontId] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_FONT.id;
    return getStoredFontId();
  });
  const mounted = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    const font = fonts.find((f) => f.id === fontId);
    if (font) {
      document.body.style.fontFamily = font.variable;
    }
  }, [fontId]);

  function handleFontChange(id: string) {
    setFontId(id);
    const font = fonts.find((f) => f.id === id);
    if (font) {
      document.body.style.fontFamily = font.variable;
      localStorage.setItem(FONT_STORAGE_KEY, id);
    }
  }

  if (!mounted) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground hover:bg-accent/60"
        >
          <Settings className="size-[15px]" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Customize your appearance.</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <section>
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Theme
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs transition-colors hover:bg-accent/50",
                    theme === t.id
                      ? "border-primary ring-1 ring-primary"
                      : "border-border",
                  )}
                >
                  <div className="flex gap-1">
                    <span
                      className="inline-block size-3.5 rounded-full border border-border/50"
                      style={{ background: t.previewColors.surface }}
                    />
                    <span
                      className="inline-block size-3.5 rounded-full border border-border/50"
                      style={{ background: t.previewColors.accentPrimary }}
                    />
                    <span
                      className="inline-block size-3.5 rounded-full border border-border/50"
                      style={{ background: t.previewColors.accentSecondary }}
                    />
                  </div>
                  <span>{t.name}</span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Font
            </h3>
            <Select value={fontId} onValueChange={handleFontChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fonts.map((f) => (
                  <SelectItem
                    key={f.id}
                    value={f.id}
                    style={{ fontFamily: f.variable }}
                  >
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
