import Link from "next/link";
import { Github } from "lucide-react";
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
            <Link
              href="https://x.com/chauhan2903"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground [&_svg]:size-5"
              aria-label="X (Twitter)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" className="size-5" aria-hidden>
                <path d="M453.2 112L523.8 112L369.6 288.2L551 528L409 528L297.7 382.6L170.5 528L99.8 528L264.7 339.5L90.8 112L236.4 112L336.9 244.9L453.2 112zM428.4 485.8L467.5 485.8L215.1 152L173.1 152L428.4 485.8z" />
              </svg>
            </Link>
            <Link
              href="https://github.com/Divyansh2903"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground"
              aria-label="GitHub"
            >
              <Github className="size-5" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
