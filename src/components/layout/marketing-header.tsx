"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/lib/button-variants";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { AppLogo } from "@/components/ui/app-logo";
import { cn } from "@/lib/utils";

export function MarketingHeader({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border/40 bg-background/60 shadow-sm shadow-black/[0.04] backdrop-blur-2xl backdrop-saturate-[1.15] dark:border-white/[0.06] dark:bg-background/50 dark:shadow-black/10"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="group flex items-center gap-2.5"
        >
          <AppLogo size="md" className="transition-shadow duration-300 group-hover:shadow-lg group-hover:shadow-primary/30" />
          <span className="font-display text-lg font-bold tracking-tight transition-colors group-hover:text-primary">
            ConfigVault
          </span>
        </Link>

        <nav className="flex items-center gap-3">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ size: "sm" }),
                "shadow-sm shadow-primary/10"
              )}
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "text-muted-foreground transition-colors hover:text-foreground"
                )}
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "shadow-md shadow-primary/20 transition-shadow hover:shadow-lg hover:shadow-primary/25"
                )}
              >
                Get Started
              </Link>
            </>
          )}
          <div className="ml-1">
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
