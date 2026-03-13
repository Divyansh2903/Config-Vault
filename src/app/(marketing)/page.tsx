import Link from "next/link";
import { Layers, Shield, ScrollText, ArrowRight, CheckCircle2 } from "lucide-react";
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
    title: "Environment-aware Config Management",
    description:
      "Organize config entries across development, staging, and production environments. Track required keys and ensure deployment readiness.",
  },
  {
    icon: Shield,
    title: "Secure Secret Access & Sharing",
    description:
      "Store secrets with AES-256 encryption. Control who can reveal, rotate, and share secrets with time-limited, view-limited share links.",
  },
  {
    icon: ScrollText,
    title: "Audit Trails & Deployment Readiness",
    description:
      "Every action is logged. Compare environments to spot missing required config keys before deployment.",
  },
];

const steps = [
  { number: "01", title: "Create a project", description: "Set up a new project in seconds and invite your team." },
  { number: "02", title: "Define environments", description: "Add development, staging, production — or any custom stage." },
  { number: "03", title: "Add and manage config entries", description: "Store secrets and config values with full version history." },
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,oklch(0.55_0.15_195/0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,oklch(0.55_0.15_195/0.08),transparent)]" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-size-[4rem_4rem] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)]" />

        <div className="mx-auto max-w-4xl px-6 py-28 text-center sm:py-36">
          <div className="animate-fade-in-up mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
            <Shield className="size-3" />
            Secure config management for teams
          </div>

          <h1 className="animate-fade-in-up delay-100 font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Manage secrets and config{" "}
            <span className="bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              safely across environments
            </span>
          </h1>

          <p className="animate-fade-in-up delay-200 mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            ConfigVault helps development teams securely store, share, and audit
            environment variables and configuration values across projects and
            deployment stages.
          </p>

          <div className="animate-fade-in-up delay-300 mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className={cn(buttonVariants({ size: "lg" }), "gap-2 shadow-md shadow-primary/20")}
            >
              Get Started
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/dashboard"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-b">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mb-14 text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to manage config
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              From encrypted storage to deployment readiness checks, ConfigVault
              covers the full lifecycle of your configuration data.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5"
              >
                <CardHeader>
                  <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-primary/15 to-primary/5 text-primary">
                    <feature.icon className="size-5" />
                  </div>
                  <CardTitle className="font-display">{feature.title}</CardTitle>
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
        <div className="mx-auto max-w-4xl px-6 py-24">
          <div className="mb-14 text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              How it works
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Get up and running in minutes — no complex setup required.
            </p>
          </div>

          <div className="relative grid gap-8 sm:grid-cols-3">
            <div className="pointer-events-none absolute top-8 right-[17%] left-[17%] hidden h-px bg-linear-to-r from-transparent via-border to-transparent sm:block" />
            {steps.map((step) => (
              <div key={step.number} className="relative text-center">
                <div className="mb-4 font-display text-5xl font-black text-primary/15">
                  {step.number}
                </div>
                <h3 className="mb-2 font-display text-lg font-bold">{step.title}</h3>
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
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_110%,oklch(0.55_0.15_195/0.06),transparent)] dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_110%,oklch(0.55_0.15_195/0.04),transparent)]" />
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
            <CheckCircle2 className="size-7 text-primary" />
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to secure your team&apos;s config?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Start managing secrets and configuration values with confidence.
            Free to get started, no credit card required.
          </p>
          <div className="mt-8">
            <Link
              href="/register"
              className={cn(buttonVariants({ size: "lg" }), "gap-2 shadow-md shadow-primary/20")}
            >
              Get Started
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
