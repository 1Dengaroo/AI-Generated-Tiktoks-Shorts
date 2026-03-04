"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { useEffect } from "react";
import { DEFAULT_THEME, isDarkTheme, themeIds } from "./theme-registry";
import type { ThemeId } from "./theme-registry.types";

function DarkClassManager() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const html = document.documentElement;
    if (resolvedTheme && isDarkTheme(resolvedTheme as ThemeId)) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [resolvedTheme]);

  return null;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme={DEFAULT_THEME}
      themes={themeIds}
      enableSystem={false}
      disableTransitionOnChange
    >
      <DarkClassManager />
      {children}
    </NextThemesProvider>
  );
}
