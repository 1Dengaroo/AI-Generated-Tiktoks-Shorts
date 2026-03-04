import type {
  ThemeDefinition,
  ThemeId,
  FontDefinition,
} from "./theme-registry.types";

const DARK_THEMES: Set<ThemeId> = new Set(["dark", "claude", "tiktok"]);

export const themes: ThemeDefinition[] = [
  {
    id: "light",
    name: "Light",
    description: "Warm cream with coral accents",
    isDark: false,
    previewColors: {
      surface: "hsl(20 25% 93%)",
      accentPrimary: "hsl(350 78% 52%)",
      accentSecondary: "hsl(18 20% 87%)",
    },
  },
  {
    id: "dark",
    name: "Dark",
    description: "Warm darks with hot coral",
    isDark: true,
    previewColors: {
      surface: "hsl(15 12% 8%)",
      accentPrimary: "hsl(350 85% 60%)",
      accentSecondary: "hsl(15 15% 20%)",
    },
  },
  {
    id: "reddit",
    name: "Reddit",
    description: "Upvote orange on clean white",
    isDark: false,
    previewColors: {
      surface: "hsl(0 0% 96%)",
      accentPrimary: "hsl(24 100% 50%)",
      accentSecondary: "hsl(220 6% 90%)",
    },
  },
  {
    id: "claude",
    name: "Claude",
    description: "Terracotta on warm darks",
    isDark: true,
    previewColors: {
      surface: "hsl(30 15% 10%)",
      accentPrimary: "hsl(28 70% 52%)",
      accentSecondary: "hsl(30 12% 22%)",
    },
  },
  {
    id: "tiktok",
    name: "TikTok",
    description: "Neon cyan & rose on black",
    isDark: true,
    previewColors: {
      surface: "hsl(240 5% 4%)",
      accentPrimary: "hsl(180 85% 55%)",
      accentSecondary: "hsl(345 82% 58%)",
    },
  },
];

export const fonts: FontDefinition[] = [
  {
    id: "plus-jakarta",
    name: "Plus Jakarta Sans",
    variable: "var(--font-plus-jakarta)",
  },
  {
    id: "bricolage",
    name: "Bricolage Grotesque",
    variable: "var(--font-bricolage)",
  },
  { id: "lora", name: "Lora", variable: "var(--font-lora)" },
  { id: "outfit", name: "Outfit", variable: "var(--font-outfit)" },
  {
    id: "instrument-sans",
    name: "Instrument Sans",
    variable: "var(--font-instrument-sans)",
  },
  {
    id: "space-grotesk",
    name: "Space Grotesk",
    variable: "var(--font-space-grotesk)",
  },
  {
    id: "nunito",
    name: "Nunito",
    variable: "var(--font-nunito)",
  },
];

export const DEFAULT_THEME: ThemeId = "dark";
export const DEFAULT_FONT = fonts[0];
export const themeIds = themes.map((t) => t.id);

export function isDarkTheme(id: ThemeId): boolean {
  return DARK_THEMES.has(id);
}
