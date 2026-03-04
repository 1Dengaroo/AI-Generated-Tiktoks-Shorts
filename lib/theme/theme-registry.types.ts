export type ThemeId = "light" | "dark" | "reddit" | "claude" | "tiktok";

export type ThemeDefinition = {
  id: ThemeId;
  name: string;
  description: string;
  isDark: boolean;
  previewColors: {
    surface: string;
    accentPrimary: string;
    accentSecondary: string;
  };
};

export type FontDefinition = {
  id: string;
  name: string;
  variable: string;
};
