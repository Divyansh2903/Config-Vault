export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-svh items-center justify-center bg-background p-4">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,oklch(0.55_0.15_195/0.08),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,oklch(0.55_0.15_195/0.05),transparent)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(oklch(0.55_0.15_195/0.06)_1px,transparent_1px)] bg-size-[32px_32px] dark:bg-[radial-gradient(oklch(0.55_0.15_195/0.04)_1px,transparent_1px)]" />
      {children}
    </div>
  );
}
