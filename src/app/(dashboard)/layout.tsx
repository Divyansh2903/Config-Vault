import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export const dynamic = "force-dynamic";

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
        <header className="flex h-14 items-center justify-end border-b px-6">
          <ThemeToggle />
        </header>
        <main className="relative flex-1 overflow-y-auto p-6">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(oklch(0.55_0.15_195/0.03)_1px,transparent_1px)] bg-size-[24px_24px] dark:bg-[radial-gradient(oklch(0.55_0.15_195/0.02)_1px,transparent_1px)]" />
          {children}
        </main>
      </div>
    </div>
  );
}
