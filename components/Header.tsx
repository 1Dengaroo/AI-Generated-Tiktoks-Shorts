"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, FolderOpen } from "lucide-react";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";

import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/create", label: "Create", icon: Plus },
  { href: "/clips", label: "Clips", icon: FolderOpen },
];

export function Header() {
  const { isSignedIn } = useAuth();
  const pathname = usePathname();

  return (
    <header className="relative z-20 border-b border-border/40">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        {/* Left: logo + nav */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
          >
            <div className="flex size-6 items-center justify-center rounded-lg bg-primary">
              <svg viewBox="0 0 32 32" className="size-3.5" fill="none">
                <path
                  d="M16 6 L26 16 L16 26 L6 16 Z"
                  fill="white"
                  opacity="0.95"
                />
              </svg>
            </div>
            <span
              className="text-sm font-bold tracking-tight"
              style={{ fontFamily: "var(--font-bricolage)" }}
            >
              r/Shorts
            </span>
          </Link>

          {isSignedIn && (
            <nav className="flex items-center gap-0.5">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                const isActive = pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="size-3.5" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* Right: theme + auth */}
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          {isSignedIn ? (
            <UserButton />
          ) : (
            <SignInButton mode="modal">
              <Button variant="outline" size="sm" className="text-xs">
                Sign in
              </Button>
            </SignInButton>
          )}
        </div>
      </div>
    </header>
  );
}
