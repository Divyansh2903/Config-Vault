import Link from "next/link";
import {
  Layers,
  Shield,
  ScrollText,
  ArrowRight,
  CheckCircle2,
  Lock,
  GitBranch,
} from "lucide-react";
import { buttonVariants } from "@/lib/button-variants";
import { AppLogo } from "@/components/ui/app-logo";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DashboardMockup } from "@/components/landing/dashboard-mockup";

const features = [
  {
    icon: Layers,
    title: "Environment-aware Config",
    description:
      "Organize config entries across development, staging, and production. Track required keys and ensure deployment readiness.",
  },
  {
    icon: Shield,
    title: "Encrypted Secret Storage",
    description:
      "AES-256 encryption for sensitive values. Granular permissions for who can reveal, rotate, and share secrets.",
  },
  {
    icon: ScrollText,
    title: "Audit Trails & Compliance",
    description:
      "Every action is logged with full context. Compare environments to spot missing config before deployment.",
  },
];


export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative">
        {/* Background container — clipped so orbs don't cause horizontal scroll */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,oklch(0.50_0.13_175/0.18),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,oklch(0.68_0.14_175/0.09),transparent)]" />

          {/* Drifting grid */}
          <div className="animate-grid-drift absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)] bg-size-[5rem_5rem] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)]" />

          {/* Floating gradient orbs */}
          <div className="animate-orb-1 absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[radial-gradient(circle,oklch(0.50_0.13_175/0.16),transparent_65%)] blur-3xl dark:bg-[radial-gradient(circle,oklch(0.68_0.14_175/0.07),transparent_65%)]" />
          <div className="animate-orb-2 absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-[radial-gradient(circle,oklch(0.55_0.10_160/0.14),transparent_65%)] blur-3xl dark:bg-[radial-gradient(circle,oklch(0.60_0.11_160/0.05),transparent_65%)]" />
          <div className="animate-orb-3 absolute -bottom-20 left-1/3 h-72 w-72 rounded-full bg-[radial-gradient(circle,oklch(0.45_0.09_190/0.14),transparent_65%)] blur-3xl dark:bg-[radial-gradient(circle,oklch(0.55_0.10_190/0.05),transparent_65%)]" />
        </div>

        <div className="mx-auto max-w-5xl px-6 pt-28 pb-8 text-center sm:pt-36">
          <div className="animate-fade-in-up mb-8 inline-flex items-center gap-2.5 rounded-full border border-primary/25 bg-primary/[0.08] px-4 py-1.5 text-xs font-semibold tracking-wide text-primary uppercase dark:border-primary/15 dark:bg-primary/5">
            <AppLogo size="xs" className="shadow-sm shadow-primary/15" />
            Secure config for teams
          </div>

          <h1 className="animate-fade-in-up delay-100 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Manage secrets & config{" "}
            <span className="relative inline-block">
              <span className="animate-text-shimmer bg-size-[200%_100%] bg-linear-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                across environments
              </span>
            </span>
          </h1>

          <p className="animate-fade-in-up delay-200 mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            ConfigVault helps development teams securely store, share, and audit
            environment variables and configuration values across projects and
            deployment stages.
          </p>

          <div className="animate-fade-in-up delay-300 mt-10">
            <Link
              href="/register"
              className={cn(
                buttonVariants({ size: "lg" }),
                "gap-2 px-6 shadow-lg shadow-primary/25 transition-shadow hover:shadow-xl hover:shadow-primary/30 dark:shadow-primary/15 dark:hover:shadow-primary/20"
              )}
            >
              Get Started Free
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <DashboardMockup />
        </div>
      </section>

      {/* Features — Bento Grid */}
      <section id="features" className="border-b">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mb-16 text-center">
            <p className="mb-3 text-xs font-semibold tracking-widest text-primary uppercase">
              Features
            </p>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to manage config
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              From encrypted storage to deployment readiness checks, ConfigVault
              covers the full lifecycle of your configuration data.
            </p>
          </div>

          {/* Bento grid: 2-col + 1-col layout */}
          <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
            {/* Feature 1 — spans 2 columns, visually dominant */}
            <Card className="animate-fade-in-up delay-100 group relative col-span-1 overflow-hidden border-border/60 transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 sm:col-span-2 sm:row-span-2">
              <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/[0.03] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <CardHeader>
                <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-primary/8 ring-1 ring-primary/10 transition-colors duration-300 group-hover:bg-primary/12">
                  <Layers className="size-5 text-primary" />
                </div>
                <CardTitle className="font-display text-xl">
                  {features[0].title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <CardDescription className="max-w-md text-sm leading-relaxed">
                  {features[0].description}
                </CardDescription>

                {/* Mini environment visualization */}
                <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                  <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                    <GitBranch className="size-3 text-primary/60" />
                    Environment Overview
                  </div>
                  <div className="space-y-2">
                    {[
                      {
                        env: "Development",
                        tag: "DEV",
                        keys: 24,
                        synced: true,
                        color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
                        bar: "w-full bg-blue-500/20",
                      },
                      {
                        env: "Staging",
                        tag: "STG",
                        keys: 22,
                        synced: true,
                        color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
                        bar: "w-[92%] bg-amber-500/20",
                      },
                      {
                        env: "Production",
                        tag: "PROD",
                        keys: 20,
                        synced: false,
                        color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
                        bar: "w-[83%] bg-emerald-500/20",
                      },
                    ].map((row) => (
                      <div
                        key={row.tag}
                        className="flex items-center gap-3 rounded-lg border border-border/40 bg-card/80 px-3 py-2"
                      >
                        <span
                          className={cn(
                            "rounded-md border px-2 py-0.5 text-[9px] font-bold",
                            row.color
                          )}
                        >
                          {row.tag}
                        </span>
                        <span className="min-w-[72px] text-[11px] font-medium">
                          {row.env}
                        </span>
                        <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn(
                              "absolute inset-y-0 left-0 rounded-full",
                              row.bar
                            )}
                          />
                        </div>
                        <span className="text-[10px] tabular-nums text-muted-foreground">
                          {row.keys} keys
                        </span>
                        {row.synced ? (
                          <CheckCircle2 className="size-3 text-emerald-500" />
                        ) : (
                          <div className="size-3 rounded-full border-2 border-amber-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="animate-fade-in-up delay-200 group relative overflow-hidden border-border/60 transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5">
              <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/[0.02] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <CardHeader>
                <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-primary/8 ring-1 ring-primary/10 transition-colors duration-300 group-hover:bg-primary/12">
                  <Shield className="size-5 text-primary" />
                </div>
                <CardTitle className="font-display text-lg">
                  {features[1].title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {features[1].description}
                </CardDescription>
                {/* Mini encryption visual */}
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-border/40 bg-muted/20 px-3 py-2">
                  <Lock className="size-3.5 text-primary/70" />
                  <div className="flex-1 font-mono text-[10px] tracking-wider text-muted-foreground">
                    ••••••••••••••••
                  </div>
                  <span className="rounded bg-primary/8 px-1.5 py-0.5 text-[8px] font-bold text-primary">
                    AES-256
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="animate-fade-in-up delay-300 group relative overflow-hidden border-border/60 transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5">
              <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/[0.02] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <CardHeader>
                <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-primary/8 ring-1 ring-primary/10 transition-colors duration-300 group-hover:bg-primary/12">
                  <ScrollText className="size-5 text-primary" />
                </div>
                <CardTitle className="font-display text-lg">
                  {features[2].title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {features[2].description}
                </CardDescription>
                {/* Mini audit log visual */}
                <div className="mt-4 space-y-1.5">
                  {[
                    { action: "Secret rotated", time: "2m ago", dot: "bg-emerald-500" },
                    { action: "Env compared", time: "5m ago", dot: "bg-blue-500" },
                    { action: "Key added", time: "12m ago", dot: "bg-amber-500" },
                  ].map((log) => (
                    <div
                      key={log.action}
                      className="flex items-center gap-2 rounded-md border border-border/30 bg-muted/15 px-2.5 py-1.5"
                    >
                      <div className={cn("size-1.5 rounded-full", log.dot)} />
                      <span className="flex-1 text-[10px] font-medium">
                        {log.action}
                      </span>
                      <span className="text-[9px] text-muted-foreground">
                        {log.time}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative border-b">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_50%_80%_at_50%_50%,oklch(0.50_0.13_175/0.06),transparent)] dark:bg-[radial-gradient(ellipse_50%_80%_at_50%_50%,oklch(0.68_0.14_175/0.02),transparent)]" />
        <div className="mx-auto max-w-5xl px-6 py-24">
          <div className="mb-16 text-center">
            <p className="mb-3 text-xs font-semibold tracking-widest text-primary uppercase">
              How it works
            </p>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Up and running in minutes
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              No complex setup required. Three simple steps to secure your
              team&apos;s configuration.
            </p>
          </div>

          <div className="relative grid gap-10 sm:grid-cols-3 sm:gap-6">
            {/* Step 1: Create a project */}
            <div className="animate-fade-in-up delay-100 group relative text-center">
              <div className="relative mx-auto mb-6 flex size-[5.5rem] items-center justify-center">
                <div className="absolute inset-0 rounded-2xl bg-primary/6 ring-1 ring-primary/10 transition-all duration-300 group-hover:bg-primary/10 group-hover:ring-primary/20" />
                {/* Mini folder illustration */}
                <div className="relative flex flex-col items-center gap-1">
                  <div className="flex items-end gap-0.5">
                    <div className="h-6 w-8 rounded-t-md rounded-b-sm border border-primary/30 bg-primary/10">
                      <div className="h-1.5 w-4 rounded-br-sm bg-primary/25" />
                    </div>
                    <div className="animate-float -mb-0.5 h-5 w-3.5 rounded-sm border border-primary/20 bg-primary/8" />
                  </div>
                  <div className="h-0.5 w-6 rounded-full bg-primary/15" />
                </div>
              </div>
              <div className="mb-1 text-[10px] font-bold tracking-widest text-primary/50 uppercase">
                Step 01
              </div>
              <h3 className="mb-2 font-display text-base font-semibold">
                Create a project
              </h3>
              <p className="mx-auto max-w-[220px] text-sm leading-relaxed text-muted-foreground">
                Set up a new project in seconds and invite your team members.
              </p>
            </div>

            {/* Step 2: Define environments */}
            <div className="animate-fade-in-up delay-200 group relative text-center">
              <div className="relative mx-auto mb-6 flex size-[5.5rem] items-center justify-center">
                <div className="absolute inset-0 rounded-2xl bg-primary/6 ring-1 ring-primary/10 transition-all duration-300 group-hover:bg-primary/10 group-hover:ring-primary/20" />
                {/* Mini environment badges */}
                <div className="flex flex-col gap-1">
                  <div className="animate-float flex items-center gap-1 rounded-md bg-blue-500/12 px-2 py-0.5 text-[8px] font-bold text-blue-600 dark:text-blue-400">
                    <div className="size-1 rounded-full bg-blue-500" />
                    DEV
                  </div>
                  <div className="animate-float delay-100 flex items-center gap-1 rounded-md bg-amber-500/12 px-2 py-0.5 text-[8px] font-bold text-amber-600 dark:text-amber-400">
                    <div className="size-1 rounded-full bg-amber-500" />
                    STG
                  </div>
                  <div className="animate-float delay-200 flex items-center gap-1 rounded-md bg-emerald-500/12 px-2 py-0.5 text-[8px] font-bold text-emerald-600 dark:text-emerald-400">
                    <div className="size-1 rounded-full bg-emerald-500" />
                    PROD
                  </div>
                </div>
              </div>
              <div className="mb-1 text-[10px] font-bold tracking-widest text-primary/50 uppercase">
                Step 02
              </div>
              <h3 className="mb-2 font-display text-base font-semibold">
                Define environments
              </h3>
              <p className="mx-auto max-w-[220px] text-sm leading-relaxed text-muted-foreground">
                Add development, staging, production — or any custom stage you
                need.
              </p>
            </div>

            {/* Step 3: Manage config entries */}
            <div className="animate-fade-in-up delay-300 group relative text-center">
              <div className="relative mx-auto mb-6 flex size-[5.5rem] items-center justify-center">
                <div className="absolute inset-0 rounded-2xl bg-primary/6 ring-1 ring-primary/10 transition-all duration-300 group-hover:bg-primary/10 group-hover:ring-primary/20" />
                {/* Mini key-value pairs */}
                <div className="flex flex-col gap-1 font-mono text-[7px]">
                  <div className="flex items-center gap-1">
                    <span className="rounded bg-primary/15 px-1 py-px font-bold text-primary">
                      DB_HOST
                    </span>
                    <span className="text-muted-foreground">=</span>
                    <span className="text-muted-foreground/70">•••</span>
                    <Lock className="size-2 text-primary/40" />
                  </div>
                  <div className="animate-float delay-100 flex items-center gap-1">
                    <span className="rounded bg-primary/15 px-1 py-px font-bold text-primary">
                      API_KEY
                    </span>
                    <span className="text-muted-foreground">=</span>
                    <span className="text-muted-foreground/70">•••</span>
                    <Lock className="size-2 text-primary/40" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="rounded bg-primary/15 px-1 py-px font-bold text-primary">
                      PORT
                    </span>
                    <span className="text-muted-foreground">=</span>
                    <span className="text-muted-foreground/80">3000</span>
                  </div>
                </div>
              </div>
              <div className="mb-1 text-[10px] font-bold tracking-widest text-primary/50 uppercase">
                Step 03
              </div>
              <h3 className="mb-2 font-display text-base font-semibold">
                Manage config entries
              </h3>
              <p className="mx-auto max-w-[220px] text-sm leading-relaxed text-muted-foreground">
                Store secrets and config values with encryption and full audit
                history.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,oklch(0.50_0.13_175/0.08),transparent)] dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,oklch(0.68_0.14_175/0.03),transparent)]" />
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <div className="animate-scale-in mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary/8 ring-1 ring-primary/10">
            <CheckCircle2 className="size-7 text-primary" />
          </div>
          <h2 className="animate-fade-in-up delay-100 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to secure your team&apos;s config?
          </h2>
          <p className="animate-fade-in-up delay-200 mx-auto mt-4 max-w-xl text-muted-foreground">
            Start managing secrets and configuration values with confidence.
            Free to get started, no credit card required.
          </p>
          <div className="animate-fade-in-up delay-300 mt-8">
            <Link
              href="/register"
              className={cn(
                buttonVariants({ size: "lg" }),
                "gap-2 px-6 shadow-lg shadow-primary/25 transition-shadow hover:shadow-xl hover:shadow-primary/30 dark:shadow-primary/15 dark:hover:shadow-primary/20"
              )}
            >
              Get Started Free
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
