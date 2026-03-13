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
    <nav className="mb-6 flex gap-1 border-b">
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
              "-mb-px px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "border-b-2 border-foreground text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
