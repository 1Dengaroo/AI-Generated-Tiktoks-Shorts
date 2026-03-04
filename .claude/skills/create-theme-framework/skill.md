---
name: create-theme-framework
description: Build a production-grade CSS theming system with semantic tokens, multiple themes, and instant switching. Use this skill when the user wants to create a theme system, add dark mode, build a theme switcher, set up CSS custom properties for theming, create multiple visual themes (dark/light/custom), or when they mention tokens, theme provider, next-themes, or want Discord/Notion-level customization. Also trigger when refactoring hardcoded colors into a token system or when asked to make an app "themeable."
---

# Build a Deep CSS Theme System

You are building a production-grade theming system from scratch. The goal is Discord/Notion-level customization — every surface, text color, border, shadow, and component detail driven by CSS custom properties, with instant theme switching and zero JS overhead at runtime.

This skill guides you through designing the token architecture, implementing the provider, and creating themes. Adapt the token groups to the specific project — not every project needs queue colors or code editor tokens, but every project benefits from systematic surface/text/accent layering.

## Philosophy

- **CSS variables are the API.** Components never hardcode colors. They reference `var(--token-name)`. Themes are just different sets of values for the same variable names.
- **Semantic, not literal.** Name tokens by purpose (`--accent-primary`), not color (`--blue-500`). A "blue" slot can be gold in a luxury theme.
- **oklch for perceptual uniformity.** When creating color families (e.g. 5 card variants at different hues), use oklch so they feel equally vibrant. Hex/rgb for one-off values is fine.
- **Dark themes need more than color inversion.** They need heavier shadows, adjusted chroma, and lifted borders. Treat them as distinct designs, not mechanical transforms.

## Architecture

### Layer 1: Token Contract

Before writing any CSS, design your token groups on paper. Every theme must implement the full contract — no optional tokens. This is what makes the system reliable.

The system uses two token layers: **semantic tokens** in oklch (L C H components) for design-level meaning, and **shadcn bridge tokens** in HSL (space-separated H S% L%) for component library compatibility.

```
SEMANTIC TOKENS (oklch L C H — used via oklch(var(--token) / <alpha>))
═══════════════════════════════════════════════════════════════════════

ACCENTS (the personality)
├── --accent-primary        Primary accent (links, highlights, brand)
└── --accent-secondary      Secondary accent

SURFACES
├── --surface-primary       Main content surface
├── --surface-secondary     Secondary/grouped content surface
├── --surface-elevated      Elevated elements (modals, dropdowns)
└── --surface-overlay       Overlay backdrop

BORDERS
├── --border-default        Standard borders
├── --border-subtle         Barely-there dividers
└── --border-strong         Emphasized borders

TEXT
├── --text-primary          Main body text (highest contrast)
├── --text-secondary        Labels, descriptions
├── --text-muted            Placeholders, disabled
└── --text-inverse          Text on inverse surfaces

SHADOWS (full CSS shadow values, not oklch components)
├── --shadow-sm             Small shadow
├── --shadow-md             Medium shadow
└── --shadow-lg             Large shadow

SHADCN BRIDGE TOKENS (HSL space-separated — used via hsl(var(--token)))
═══════════════════════════════════════════════════════════════════════

PAGE
├── --background            Page background
├── --foreground            Page foreground text

COMPONENTS
├── --card / --card-foreground           Card surface/text
├── --popover / --popover-foreground     Popover surface/text
├── --primary / --primary-foreground     Primary action
├── --secondary / --secondary-foreground Secondary action
├── --muted / --muted-foreground         Muted/disabled
├── --accent / --accent-foreground       Accent highlights
├── --destructive / --destructive-foreground  Error/destructive

UI ELEMENTS
├── --border                Default border
├── --input                 Input border
├── --ring                  Focus ring
└── --radius                Border radius (e.g. 0.5rem)

DATA VISUALIZATION
├── --chart-1 through --chart-5

SIDEBAR (if your app has one)
├── --sidebar-background / --sidebar-foreground
├── --sidebar-primary / --sidebar-primary-foreground
├── --sidebar-accent / --sidebar-accent-foreground
├── --sidebar-border / --sidebar-ring
```

**Write a contract file** (e.g. `styles/themes/_contract.css`) that lists every token with a one-line description. This is your source of truth. Every theme author references this.

### Layer 2: Theme CSS Files

Each theme is a single CSS file with all variables inside a scoped selector. Use `[data-theme="<name>"]` as the selector — this pairs with the JS provider.

File structure:

```
styles/themes/
├── _contract.css       # Documentation only — lists all required tokens
├── light.css           # [data-theme="light"] { ... }
├── dark.css            # [data-theme="dark"] { ... }
├── <custom>.css        # [data-theme="<custom>"] { ... }
```

**Full light and dark theme examples** with inline commentary. These are complete, copy-paste-ready references — no `...` placeholders.

The system uses two color spaces in parallel:

- **oklch components** (`L C H` — three space-separated numbers) for semantic tokens, consumed via `oklch(var(--token) / <alpha>)`
- **HSL space-separated** (`H S% L%`) for shadcn bridge tokens, consumed via `hsl(var(--token))`

This dual approach gives you perceptual uniformity for design tokens and drop-in shadcn/ui compatibility.

```css
[data-theme="light"] {
  /*
   * SEMANTIC TOKENS (oklch L C H)
   * =============================
   * These define the design language. Components use them via:
   *   background: oklch(var(--surface-primary));
   *   color: oklch(var(--text-primary));
   *   background: oklch(var(--accent-primary) / 0.1);  ← alpha support
   *
   * The warm hue angle (50-75) gives this theme its character.
   * A cool theme would shift these to 200-240.
   */

  /* Accents — the personality. Primary is warm amber, secondary is warm red. */
  --accent-primary: 0.55 0.12 55;
  --accent-secondary: 0.58 0.1 15;

  /*
   * Surfaces — the bones.
   * Page bg is L 0.96 (warm cream), cards are L 0.98 (near-white).
   * That 2-unit gap is what makes cards "exist" without heavy shadows.
   */
  --surface-primary: 0.96 0.01 75;
  --surface-secondary: 0.94 0.012 70;
  --surface-elevated: 0.98 0.005 75;
  --surface-overlay: 0.25 0.015 50;

  /*
   * Borders — three tiers.
   * Warm undertone (hue 55-70) matches the warm surfaces.
   * Cool gray borders on warm backgrounds look disconnected.
   */
  --border-default: 0.86 0.02 65;
  --border-subtle: 0.91 0.012 70;
  --border-strong: 0.72 0.035 55;

  /*
   * Text — don't use pure black (L 0.0). L 0.2 is warm charcoal.
   * Each tier drops ~0.15-0.20 in lightness from the previous.
   */
  --text-primary: 0.2 0.02 50;
  --text-secondary: 0.4 0.02 50;
  --text-muted: 0.55 0.018 55;
  --text-inverse: 0.95 0.008 75;

  /*
   * Shadows — use oklch in the alpha channel for theme-tinted shadows.
   * Warm hue (50) keeps shadows cohesive with the palette.
   */
  --shadow-sm: 0 1px 2px oklch(0.25 0.02 50 / 0.08);
  --shadow-md: 0 4px 6px oklch(0.25 0.02 50 / 0.1);
  --shadow-lg: 0 10px 15px oklch(0.25 0.02 50 / 0.14);

  /*
   * SHADCN BRIDGE TOKENS (HSL space-separated: H S% L%)
   * ====================================================
   * These power ALL shadcn/ui components. They map 1:1 to shadcn's expected
   * CSS variable names. Components consume them as hsl(var(--token)).
   *
   * The mapping strategy:
   *   --background / --foreground → page bg/text
   *   --card / --card-foreground  → card surface/text
   *   --primary / --primary-fg    → CTA color
   *   --muted / --muted-fg        → disabled/placeholder
   *   --border                    → all component borders
   *   --ring                      → focus rings
   */
  --background: 42 30% 91%;
  --foreground: 30 15% 12%;
  --card: 40 25% 97%;
  --card-foreground: 30 15% 12%;
  --popover: 40 30% 97%;
  --popover-foreground: 30 15% 12%;
  --primary: 38 65% 42%;
  --primary-foreground: 40 50% 97%;
  --secondary: 30 20% 88%;
  --secondary-foreground: 30 18% 18%;
  --muted: 38 18% 92%;
  --muted-foreground: 30 10% 42%;
  --accent: 38 18% 92%;
  --accent-foreground: 30 15% 12%;
  --destructive: 0 65% 52%;
  --destructive-foreground: 40 50% 97%;
  --border: 35 20% 86%;
  --input: 35 20% 86%;
  --ring: 38 65% 42%;
  --radius: 0.5rem;

  /* Chart palette — spread across hue wheel for distinguishability */
  --chart-1: 38 60% 40%;
  --chart-2: 15 45% 50%;
  --chart-3: 55 40% 48%;
  --chart-4: 25 50% 55%;
  --chart-5: 5 40% 48%;

  /* Sidebar — slightly darker surface than page for visual separation */
  --sidebar-background: 40 30% 94%;
  --sidebar-foreground: 30 10% 40%;
  --sidebar-primary: 38 65% 38%;
  --sidebar-primary-foreground: 40 50% 97%;
  --sidebar-accent: 38 18% 90%;
  --sidebar-accent-foreground: 30 15% 12%;
  --sidebar-border: 35 20% 83%;
  --sidebar-ring: 38 65% 38%;
}
```

**Dark theme** — not a mechanical inversion. Surfaces lift from near-black, borders get brighter, shadows get heavier opacity, and accent lightness bumps up for contrast.

```css
[data-theme="dark"] {
  /*
   * SEMANTIC TOKENS (oklch L C H)
   * =============================
   * Dark surfaces start at L 0.16 and step UP. The elevation hierarchy is:
   *   overlay (0.08) → primary (0.16) → secondary (0.19) → elevated (0.22)
   *
   * Accent lightness bumps from 0.55→0.62 to maintain contrast against
   * dark backgrounds. Chroma stays the same — don't desaturate for dark mode.
   */
  --accent-primary: 0.62 0.12 65;
  --accent-secondary: 0.6 0.1 25;

  --surface-primary: 0.16 0.015 50;
  --surface-secondary: 0.19 0.018 50;
  --surface-elevated: 0.22 0.02 50;
  --surface-overlay: 0.08 0.01 50;

  /*
   * Dark borders need L 0.22-0.32 to be visible.
   * Light-mode border values (L 0.86) are invisible on dark backgrounds.
   */
  --border-default: 0.32 0.03 50;
  --border-subtle: 0.26 0.025 50;
  --border-strong: 0.42 0.04 55;

  /* Text lightness inverts: primary is now L 0.9 (near-white) */
  --text-primary: 0.9 0.025 65;
  --text-secondary: 0.72 0.03 60;
  --text-muted: 0.55 0.03 55;
  --text-inverse: 0.14 0.015 50;

  /*
   * Shadows need 3-4x the opacity of light mode to be visible
   * against dark backgrounds. Pure black (0 0 0) works well here.
   */
  --shadow-sm: 0 1px 2px oklch(0 0 0 / 0.3);
  --shadow-md: 0 4px 6px oklch(0 0 0 / 0.35);
  --shadow-lg: 0 10px 15px oklch(0 0 0 / 0.4);

  /* SHADCN BRIDGE TOKENS (HSL) */
  --background: 30 12% 7%;
  --foreground: 38 30% 88%;
  --card: 30 12% 11%;
  --card-foreground: 38 30% 88%;
  --popover: 30 12% 6%;
  --popover-foreground: 38 30% 88%;
  --primary: 40 55% 52%;
  --primary-foreground: 30 40% 96%;
  --secondary: 30 15% 20%;
  --secondary-foreground: 38 25% 82%;
  --muted: 30 10% 14%;
  --muted-foreground: 35 20% 58%;
  --accent: 30 10% 14%;
  --accent-foreground: 38 30% 88%;
  --destructive: 0 75% 50%;
  --destructive-foreground: 30 40% 96%;
  --border: 30 14% 20%;
  --input: 30 14% 20%;
  --ring: 40 55% 52%;
  --radius: 0.5rem;
  --chart-1: 40 50% 45%;
  --chart-2: 20 45% 50%;
  --chart-3: 55 40% 50%;
  --chart-4: 10 50% 55%;
  --chart-5: 60 35% 45%;
  --sidebar-background: 30 12% 3%;
  --sidebar-foreground: 35 20% 55%;
  --sidebar-primary: 40 55% 45%;
  --sidebar-primary-foreground: 30 40% 96%;
  --sidebar-accent: 30 10% 8%;
  --sidebar-accent-foreground: 38 30% 88%;
  --sidebar-border: 30 14% 15%;
  --sidebar-ring: 40 55% 45%;
}
```

### Using the Dual Token System in Components

Components can use either token layer depending on context:

```tsx
/* oklch semantic tokens — for custom/design-specific styling */
<div style={{
  background: 'oklch(var(--surface-primary))',
  color: 'oklch(var(--text-primary))',
  borderColor: 'oklch(var(--border-default))',
  boxShadow: 'var(--shadow-md)'
}}>
  {/* Semi-transparent accent for hover effects */}
  <span style={{ background: 'oklch(var(--accent-primary) / 0.1)' }}>
    Highlighted
  </span>
</div>

/* HSL shadcn bridge tokens — for shadcn/ui components via Tailwind */
<Card className="bg-card text-card-foreground border">
  <CardHeader>
    <CardTitle className="text-primary">Title</CardTitle>
    <p className="text-muted-foreground">Description</p>
  </CardHeader>
</Card>
```

The semantic tokens give you alpha-channel support (oklch's `/` syntax) and perceptual uniformity. The shadcn bridge tokens give you drop-in component library compatibility.

### Layer 3: Theme Registry (TypeScript)

A central registry that lists all available themes with metadata. This powers the theme picker UI.

```ts
// lib/theme/theme-registry.ts

export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  isDark: boolean;
  previewColors: [string, string, string]; // [surface, primary accent, secondary accent]
}

export const themes: ThemeDefinition[] = [
  {
    id: "light",
    name: "Light",
    description: "Warm and refined",
    isDark: false,
    previewColors: [
      "oklch(0.96 0.01 75)",
      "oklch(0.55 0.12 55)",
      "oklch(0.58 0.1 15)",
    ],
  },
  {
    id: "dark",
    name: "Dark",
    description: "Rich and elegant",
    isDark: true,
    previewColors: [
      "oklch(0.16 0.015 50)",
      "oklch(0.62 0.12 65)",
      "oklch(0.6 0.1 25)",
    ],
  },
];

export const themeIds = themes.map((t) => t.id);
export const darkThemeIds = themes.filter((t) => t.isDark).map((t) => t.id);

export function getThemeDefinition(id: string): ThemeDefinition | undefined {
  return themes.find((t) => t.id === id);
}
```

### Layer 4: Theme Provider (React)

Use `next-themes` for Next.js projects or a lightweight context for others. The key behaviors:

1. Set `data-theme` attribute on `<html>` (this activates the CSS selector)
2. Persist the user's choice (localStorage)
3. Sync a `.dark` class for Tailwind's `dark:` variant (if using Tailwind)
4. Add `suppressHydrationWarning` to `<html>` to avoid React hydration mismatch warnings

**IMPORTANT: Hydration flash prevention.** `next-themes` injects an inline script that sets `data-theme` on `<html>` before React hydrates. This means the server-rendered HTML won't match the client on first paint (the server doesn't know the user's saved theme). Add `suppressHydrationWarning` to the `<html>` element in your root layout:

```tsx
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="data-theme"
          themes={themeIds}
          defaultTheme="light"
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

Without `suppressHydrationWarning`, you'll get console warnings about attribute mismatches on every page load. The `disableTransitionOnChange` prop prevents a flash of transition animations when the theme is applied.

**Next.js + next-themes provider:**

```tsx
// lib/theme/theme-provider.tsx
"use client";

import { useEffect } from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { themeIds, getThemeDefinition } from "./theme-registry";

function DarkClassManager() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!resolvedTheme) return;
    const def = getThemeDefinition(resolvedTheme);
    document.documentElement.classList.toggle("dark", def?.isDark ?? false);
  }, [resolvedTheme]);

  return null;
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
}: {
  children: React.ReactNode;
  defaultTheme?: string;
}) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme={defaultTheme}
      themes={themeIds}
      enableSystem={false}
      disableTransitionOnChange
    >
      <DarkClassManager />
      {children}
    </NextThemesProvider>
  );
}
```

**Vanilla JS (no framework):**

```js
function setTheme(id) {
  document.documentElement.setAttribute("data-theme", id);
  document.documentElement.classList.toggle("dark", isDarkTheme(id));
  localStorage.setItem("theme", id);
}

// On load
const saved = localStorage.getItem("theme") || "light";
setTheme(saved);
```

### Layer 5: Bridging to Tailwind

Bridge both token layers to Tailwind in `tailwind.config.ts`:

```ts
// tailwind.config.ts
export default {
  darkMode: ["class"], // .dark class managed by DarkClassManager
  theme: {
    extend: {
      colors: {
        // shadcn bridge tokens → Tailwind (HSL)
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        // Semantic tokens → Tailwind (oklch with alpha support)
        "accent-primary": "oklch(var(--accent-primary) / <alpha-value>)",
        "accent-secondary": "oklch(var(--accent-secondary) / <alpha-value>)",
      },
    },
  },
};
```

This lets you write `bg-background`, `text-foreground`, `bg-accent-primary/10` etc. in markup.

## Implementation Checklist

When building this system for a new project:

1. **Audit the UI.** Walk through every component and list every color, background, border, and shadow used. Group them by purpose (surface, text, accent, feedback, domain-specific).

2. **Design the token contract.** Write `_contract.css` listing every token with a description. Aim for 60–120 tokens depending on complexity. Err on the side of more granularity — it's easier to map two tokens to the same value than to split one later.

3. **Create the light theme first.** It's easier to get contrast right on light backgrounds. Define every token.

4. **Create the dark theme second.** Don't invert — redesign. Lift surfaces from black, bump accent lightness, add shadow overrides.

5. **Set up the provider.** Wire up `data-theme` attribute switching and `.dark` class syncing.

6. **Refactor components.** Replace every hardcoded color with `var(--token)`. This is the tedious part. Do it systematically, one component at a time.

7. **Bridge to Tailwind** (if applicable). Map tokens in `@theme inline` or `tailwind.config.js`.

8. **Build the theme picker.** Use `previewColors` from the registry for swatch previews.

9. **Add creative themes.** Once the foundation works, this is the fun part — each new theme is just a CSS file and a registry entry.

## Design Principles for Specific Theme Types

**Neutral themes** (light/dark): Low chroma accents, generous contrast, nothing distracting. Let the content breathe.

**Playful themes**: High chroma, saturated queue/card colors. Multi-stop gradients with color shifts. Push oklch chroma to 0.15–0.24 for accents.

**Luxury/refined themes**: Near-monochrome with ONE metallic accent (gold, silver, copper). Differentiate by luminance, not hue. Low chroma across the board (0.02–0.08). Warm shadow hues.

**High-contrast/accessible themes**: WCAG AAA (7:1) on all text/background pairs. Avoid relying on color alone — pair with icons/text. Test with contrast checkers.

**Novelty/concept themes** (cyberpunk, thermal, etc.): Commit fully to the metaphor. Rename the comment block headers to match the concept. Every token should feel intentional within the narrative.

## Settings Dialog UI Pattern

When building a theme picker, consolidate all personalization controls (theme, editor color, font) into a single **Settings dialog** triggered by a ghost icon button. This avoids header clutter from multiple dropdowns and works on both desktop and mobile without a separate mobile component.

### Trigger Button

Use a ghost icon button that stays subtle until hovered:

```tsx
<DialogTrigger asChild>
  <Button
    variant="ghost"
    size="icon-sm"
    className="text-muted-foreground hover:text-foreground hover:bg-accent/60"
  >
    <SettingsIcon className="size-[15px]" />
  </Button>
</DialogTrigger>
```

### Dialog Structure

The dialog contains vertically stacked sections, each with a label and a selection grid/list. Every option shows a visual preview (color swatches, font sample) so the user can pick without reading names.

```tsx
<DialogContent className="max-w-md">
  <DialogHeader>
    <DialogTitle>Settings</DialogTitle>
    <DialogDescription>Customize your editor appearance.</DialogDescription>
  </DialogHeader>
  <div className="space-y-6">
    {/* Each section follows the same pattern */}
    <section>
      <h3 className="mb-3 text-sm font-medium">Section Label</h3>
      {/* Grid for card-style options, flex-col for list-style options */}
    </section>
  </div>
</DialogContent>
```

### Theme/Editor Color Cards (Grid Layout)

Use a 3-column grid of cards with color swatch dots and a name. Selected state uses `border-primary ring-1 ring-primary`.

```tsx
<div className="grid grid-cols-3 gap-2">
  {themes.map((t) => (
    <button
      key={t.id}
      onClick={() => setTheme(t.id)}
      className={`hover:bg-accent/50 flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs transition-colors ${
        mounted && t.id === currentTheme.id
          ? "border-primary ring-primary ring-1"
          : "border-border"
      }`}
    >
      <div className="flex gap-1">
        {/* Color swatch dots showing bg, primary, accent */}
        <span
          className="border-border/50 inline-block size-3.5 rounded-full border"
          style={{ background: t.previewColors.bg }}
        />
        <span
          className="border-border/50 inline-block size-3.5 rounded-full border"
          style={{ background: t.previewColors.primary }}
        />
        <span
          className="border-border/50 inline-block size-3.5 rounded-full border"
          style={{ background: t.previewColors.accent }}
        />
      </div>
      <span>{t.name}</span>
    </button>
  ))}
</div>
```

### Font Options (List Layout)

Use a vertical list where each option renders in its own typeface. This lets the user preview the font before selecting.

```tsx
<div className="flex flex-col gap-1">
  {fonts.map((f) => (
    <button
      key={f.id}
      onClick={() => setFont(f.id)}
      className={`hover:bg-accent/50 flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors ${
        f.id === currentFont.id
          ? "border-primary ring-primary ring-1"
          : "border-border"
      }`}
      style={{ fontFamily: `var(${f.variable})` }}
    >
      <span>{f.name}</span>
      {f.id === currentFont.id && (
        <CheckIcon className="text-primary size-3.5" />
      )}
    </button>
  ))}
</div>
```

### Key Design Decisions

- **Dialog over dropdowns.** One dialog replaces 3-4 separate dropdown menus. Cleaner header, better mobile UX.
- **Immediate application.** Theme/font changes apply instantly when clicked, no "save" button needed.
- **Visual previews over text labels.** Color swatches and font samples let users pick visually without guessing.
- **Consistent selected state.** Every option type uses the same `border-primary ring-1 ring-primary` pattern for selection.
- **Grid for swatches, list for text.** Cards with color dots work in a grid; font options that need horizontal space work as a vertical list.
- **No separate mobile component.** The Dialog component is naturally responsive. No need for a separate `MobileSettingsMenu`.

## Common Pitfalls

- **Missing tokens**: If one theme defines a token and another doesn't, components will inherit the wrong value. The contract must be exhaustive and every theme must implement ALL of it.
- **Insufficient dark-mode contrast**: `--border` values that work on white (#e0e0e0) are invisible on dark (#1a1a1a). Dark borders need lightness 0.22–0.30 in oklch.
- **Forgetting shadow overrides**: Default light-mode shadows vanish on dark backgrounds. Dark themes need opacity 0.3–0.7 depending on depth.
- **Over-relying on opacity**: `rgba(0,0,0,0.1)` looks great on white, muddy on colored backgrounds. Prefer explicit colors per theme.
- **Not testing the code editor**: If your app embeds a code editor, syntax token colors must contrast against the editor background, not the page background. The editor is its own color context.
