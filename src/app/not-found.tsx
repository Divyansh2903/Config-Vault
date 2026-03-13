import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,oklch(0.55_0.15_195/0.05),transparent)] dark:bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,oklch(0.55_0.15_195/0.03),transparent)]" />
      <p className="font-display text-8xl font-black text-primary/15">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl">
        Page Not Found
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 transition-colors hover:bg-primary/90"
      >
        Back to Home
      </Link>
    </div>
  );
}
