import Link from "next/link";
import { Lock } from "lucide-react";
import { AppLogo } from "@/components/ui/app-logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-svh font-roboto text-sm">
      {/* Decorative side panel — visible on larger screens */}
      <div className="hidden w-[45%] flex-col justify-between bg-linear-to-br from-primary/[0.10] via-primary/[0.05] to-transparent p-10 dark:from-primary/[0.06] dark:via-primary/[0.03] lg:flex">
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <AppLogo size="md" />
          <span className="font-display text-lg font-bold tracking-tight">ConfigVault</span>
        </Link>

        <div className="max-w-sm">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground/90">
            Secure config management for modern teams
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Store, share, and audit environment variables and secrets across all your projects and deployment stages.
          </p>

          <div className="mt-8 space-y-3">
            {[
              "AES-256 encrypted secret storage",
              "Role-based access control",
              "Full audit trail for compliance",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <svg className="size-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                {feature}
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground/60">
          &copy; {new Date().getFullYear()} ConfigVault
        </p>
      </div>

      {/* Form side */}
      <div className="relative flex flex-1 flex-col items-center justify-center p-6">
        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_40%_at_50%_-10%,oklch(0.50_0.13_175/0.08),transparent)] dark:bg-[radial-gradient(ellipse_60%_40%_at_50%_-10%,oklch(0.68_0.14_175/0.03),transparent)]" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(oklch(0.50_0.13_175/0.05)_1px,transparent_1px)] bg-size-[32px_32px] dark:bg-[radial-gradient(oklch(0.68_0.14_175/0.02)_1px,transparent_1px)]" />

        {/* Mobile-only logo */}
        <Link href="/" className="animate-fade-in mb-8 flex items-center gap-2.5 transition-opacity hover:opacity-80 lg:hidden">
          <AppLogo size="md" />
          <span className="font-display text-xl font-bold tracking-tight">ConfigVault</span>
        </Link>

        <div className="animate-fade-in-up delay-100 w-full max-w-[400px]">
          {children}
        </div>

        {/* Trust signal below card */}
        <div className="animate-fade-in delay-300 mt-6 flex items-center gap-1.5 text-xs text-muted-foreground/50">
          <Lock className="size-3" />
          <span>Secured with AES-256 encryption</span>
        </div>
      </div>
    </div>
  );
}
