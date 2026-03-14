"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface ProjectSubNavProps {
  projectId: string;
  isOwner: boolean;
}

export function ProjectSubNav({ projectId, isOwner }: ProjectSubNavProps) {
  const pathname = usePathname();
  const base = `/projects/${projectId}`;

  const links = [
    { href: base, label: "Overview" },
    { href: `${base}/members`, label: "Members" },
    { href: `${base}/audit-log`, label: "Audit Log" },
    ...(isOwner ? [{ href: `${base}/settings`, label: "Settings" }] : []),
  ];

  return (
    <nav className="mb-8 flex gap-1 border-b border-border/60 pb-px">
      {links.map((link) => {
        const isActive =
          link.href === base
            ? pathname === base
            : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "relative -mb-px rounded-t-lg px-4 py-2 text-sm font-medium transition-all duration-200",
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
          >
            {link.label}
            {isActive && (
              <span className="absolute right-2 bottom-0 left-2 h-0.5 rounded-full bg-primary animate-scale-in" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
