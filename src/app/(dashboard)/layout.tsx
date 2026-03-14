import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getUser();
  if (!data) redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar
        user={{
          fullName: data.profile.fullName,
          email: data.profile.email,
        }}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-end border-b border-border/60 px-6">
          <ThemeToggle />
        </header>
        <main className="relative flex-1 overflow-y-auto">
          {/* Subtle dot grid background */}
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(oklch(0.50_0.13_175/0.025)_1px,transparent_1px)] bg-size-[28px_28px] dark:bg-[radial-gradient(oklch(0.68_0.14_175/0.015)_1px,transparent_1px)]" />
          <div className="mx-auto max-w-7xl p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
