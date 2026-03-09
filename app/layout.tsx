import type { Metadata } from "next";
import {
  Plus_Jakarta_Sans,
  Bricolage_Grotesque,
  Lora,
  Outfit,
  Instrument_Sans,
  Space_Grotesk,
  Nunito,
} from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "@/styles/globals.css";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/lib/theme/theme-provider";
import { DEFAULT_THEME } from "@/lib/theme/theme-registry";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});
const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
});
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});
const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

const fontVariables = [
  plusJakarta.variable,
  bricolage.variable,
  lora.variable,
  outfit.variable,
  instrumentSans.variable,
  spaceGrotesk.variable,
  nunito.variable,
].join(" ");

export const metadata: Metadata = {
  title: "r/Shorts — Story-to-Video Pipeline",
  description:
    "Turn reddit-style stories into narrated, captioned short-form videos. Built for TikTok, Reels, and Shorts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme={DEFAULT_THEME} suppressHydrationWarning>
      <body
        className={`${fontVariables} antialiased`}
        style={{ fontFamily: "var(--font-plus-jakarta)" }}
      >
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: "hsl(var(--primary))",
              colorBackground: "hsl(var(--card))",
              colorText: "hsl(var(--foreground))",
              colorTextSecondary: "hsl(var(--muted-foreground))",
              colorInputBackground: "hsl(var(--input))",
              colorInputText: "hsl(var(--foreground))",
              colorDanger: "hsl(var(--destructive))",
              borderRadius: "var(--radius)",
              fontFamily: "var(--font-plus-jakarta)",
            },
            elements: {
              footer: "hidden",
              card: "shadow-none bg-transparent",
            },
          }}
        >
          <ThemeProvider>{children}</ThemeProvider>
          <Analytics />
        </ClerkProvider>
      </body>
    </html>
  );
}
