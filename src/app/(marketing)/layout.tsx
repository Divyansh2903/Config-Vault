import Link from "next/link";
import { getUser } from "@/lib/auth/get-user";
import { AppLogo } from "@/components/ui/app-logo";
import { MarketingHeader } from "@/components/layout/marketing-header";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  const isLoggedIn = !!user;

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader isLoggedIn={isLoggedIn} />

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/60 bg-muted/30 dark:bg-card/50">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <AppLogo size="xs" className="shadow-none" />
            &copy; {new Date().getFullYear()} ConfigVault
          </span>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="transition-colors hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-foreground">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
