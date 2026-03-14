import Link from "next/link";
import { Layers, Shield, ScrollText, ArrowRight, CheckCircle2, Lock, Eye, GitBranch } from "lucide-react";
import { buttonVariants } from "@/lib/button-variants";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

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

const steps = [
  { number: "01", title: "Create a project", description: "Set up a new project in seconds and invite your team members." },
  { number: "02", title: "Define environments", description: "Add development, staging, production — or any custom stage you need." },
  { number: "03", title: "Manage config entries", description: "Store secrets and config values with encryption and full audit history." },
];

const stats = [
  { icon: Lock, value: "AES-256", label: "Encryption" },
  { icon: Eye, value: "Full", label: "Audit Trail" },
  { icon: GitBranch, value: "Multi-env", label: "Support" },
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        {/* Background layers */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,oklch(0.50_0.13_175/0.10),transparent)] dark:bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,oklch(0.68_0.14_175/0.07),transparent)]" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-size-[5rem_5rem] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)]" />
        <div className="pointer-events-none absolute right-0 bottom-0 -z-10 h-64 w-64 rounded-full bg-[radial-gradient(circle,oklch(0.50_0.13_175/0.04),transparent_70%)] blur-3xl dark:bg-[radial-gradient(circle,oklch(0.68_0.14_175/0.03),transparent_70%)]" />

        <div className="mx-auto max-w-4xl px-6 py-32 text-center sm:py-40">
          <div className="animate-fade-in-up mb-8 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-1.5 text-xs font-semibold tracking-wide text-primary uppercase">
            <Shield className="size-3" />
            Secure config for teams
          </div>

          <h1 className="animate-fade-in-up delay-100 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Manage secrets & config{" "}
            <span className="relative inline-block">
              <span className="bg-linear-to-r from-primary via-primary/85 to-primary/65 bg-clip-text text-transparent">
                across environments
              </span>
            </span>
          </h1>

          <p className="animate-fade-in-up delay-200 mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            ConfigVault helps development teams securely store, share, and audit
            environment variables and configuration values across projects and
            deployment stages.
          </p>

          <div className="animate-fade-in-up delay-300 mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className={cn(buttonVariants({ size: "lg" }), "gap-2 px-6 shadow-lg shadow-primary/15 transition-shadow hover:shadow-xl hover:shadow-primary/20")}
            >
              Get Started Free
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/dashboard"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "px-6")}
            >
              View Dashboard
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="animate-fade-in-up delay-500 mx-auto mt-16 flex max-w-md items-center justify-center gap-8 sm:gap-12">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1">
                <stat.icon className="mb-1 size-4 text-primary/60" />
                <span className="font-display text-sm font-bold text-foreground">{stat.value}</span>
                <span className="text-[11px] tracking-wide text-muted-foreground uppercase">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-b">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mb-16 text-center">
            <p className="mb-3 text-xs font-semibold tracking-widest text-primary uppercase">Features</p>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to manage config
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              From encrypted storage to deployment readiness checks, ConfigVault
              covers the full lifecycle of your configuration data.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <Card
                key={feature.title}
                className={cn(
                  "group relative overflow-hidden border-border/60 transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5",
                  "animate-fade-in-up",
                  i === 0 && "delay-100",
                  i === 1 && "delay-200",
                  i === 2 && "delay-300"
                )}
              >
                <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/[0.02] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <CardHeader>
                  <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-primary/8 ring-1 ring-primary/10 transition-colors duration-300 group-hover:bg-primary/12">
                    <feature.icon className="size-5 text-primary" />
                  </div>
                  <CardTitle className="font-display text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative border-b">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_50%_80%_at_50%_50%,oklch(0.50_0.13_175/0.03),transparent)] dark:bg-[radial-gradient(ellipse_50%_80%_at_50%_50%,oklch(0.68_0.14_175/0.02),transparent)]" />
        <div className="mx-auto max-w-4xl px-6 py-24">
          <div className="mb-16 text-center">
            <p className="mb-3 text-xs font-semibold tracking-widest text-primary uppercase">How it works</p>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Up and running in minutes
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              No complex setup required. Three simple steps to secure your team&apos;s configuration.
            </p>
          </div>

          <div className="relative grid gap-10 sm:grid-cols-3 sm:gap-8">
            {/* Connecting line */}
            <div className="pointer-events-none absolute top-9 right-[17%] left-[17%] hidden h-px bg-linear-to-r from-border via-primary/20 to-border sm:block" />
            {steps.map((step, i) => (
              <div key={step.number} className={cn("animate-fade-in-up relative text-center", i === 0 && "delay-100", i === 1 && "delay-200", i === 2 && "delay-300")}>
                <div className="relative mx-auto mb-5 flex size-[4.5rem] items-center justify-center">
                  <div className="absolute inset-0 rounded-2xl bg-primary/6 ring-1 ring-primary/10" />
                  <span className="font-display text-2xl font-bold text-primary">{step.number}</span>
                </div>
                <h3 className="mb-2 font-display text-base font-semibold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,oklch(0.50_0.13_175/0.05),transparent)] dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,oklch(0.68_0.14_175/0.03),transparent)]" />
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
              className={cn(buttonVariants({ size: "lg" }), "gap-2 px-6 shadow-lg shadow-primary/15 transition-shadow hover:shadow-xl hover:shadow-primary/20")}
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
