"use client";

import { useRef, useState, useCallback } from "react";
import {
  FolderKanban,
  GitBranch,
  Users,
  Activity,
  LayoutDashboard,
  KeyRound,
} from "lucide-react";
import { AppLogo } from "@/components/ui/app-logo";
import { cn } from "@/lib/utils";

export function DashboardMockup() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 2, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      // Subtle tilt: max ±4deg
      setRotate({
        x: 2 + (0.5 - y) * 8,
        y: (x - 0.5) * 6,
      });

      // Glare follows cursor
      setGlare({ x: x * 100, y: y * 100, opacity: 0.07 });
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setRotate({ x: 2, y: 0 });
    setGlare({ x: 50, y: 50, opacity: 0 });
    setHoveredCard(null);
  }, []);

  const stats = [
    { label: "Projects", value: "12", icon: FolderKanban, color: "text-primary" },
    { label: "Environments", value: "36", icon: GitBranch, color: "text-emerald-500" },
    { label: "Members", value: "8", icon: Users, color: "text-blue-500" },
    { label: "Actions", value: "148", icon: Activity, color: "text-amber-500" },
  ];

  const projects = [
    { name: "Auth Service", envs: ["DEV", "STG", "PROD"], secrets: 12 },
    { name: "Payment API", envs: ["DEV", "STG", "PROD"], secrets: 19 },
    { name: "Web App", envs: ["DEV", "STG"], secrets: 26 },
  ];

  return (
    <div className="animate-fade-in-up delay-600 relative mx-auto mt-16 max-w-4xl">
      {/* Glow behind mockup */}
      <div className="absolute -inset-6 -z-10 rounded-3xl bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,oklch(0.50_0.13_175/0.18),transparent)] blur-2xl dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,oklch(0.68_0.14_175/0.10),transparent)]" />

      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-2xl shadow-black/[0.12] dark:border-white/[0.08] dark:bg-[oklch(0.16_0.014_225)] dark:shadow-black/40"
        style={{
          transform: `perspective(1200px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* Glare overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-20"
          style={{
            background: `radial-gradient(600px circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}), transparent 60%)`,
            transition: "opacity 0.3s ease",
          }}
        />

        {/* Bottom fade mask — inside the container so it follows the tilt */}
        <div className="pointer-events-none absolute bottom-0 left-0 z-10 h-32 w-full bg-linear-to-t from-background via-background/80 to-transparent" />

        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-black/[0.06] bg-[oklch(0.97_0.003_210)] px-4 py-2.5 dark:border-white/[0.06] dark:bg-[oklch(0.14_0.012_225)]">
          <div className="flex gap-1.5">
            <div className="size-2.5 rounded-full bg-[#ff5f57] transition-transform duration-200 hover:scale-125" />
            <div className="size-2.5 rounded-full bg-[#febc2e] transition-transform duration-200 hover:scale-125" />
            <div className="size-2.5 rounded-full bg-[#28c840] transition-transform duration-200 hover:scale-125" />
          </div>
          <div className="mx-auto flex h-5 w-52 items-center justify-center rounded-md bg-black/[0.04] text-[10px] text-black/40 dark:bg-white/[0.06] dark:text-white/40">
            configvault.app/dashboard
          </div>
        </div>

        {/* App body */}
        <div className="flex min-h-90 sm:min-h-110">
          {/* Sidebar */}
          <div className="hidden w-44 shrink-0 border-r border-black/[0.06] bg-[oklch(0.965_0.004_210)] p-3 dark:border-white/[0.06] dark:bg-[oklch(0.135_0.012_225)] sm:block">
            <div className="mb-4 flex items-center gap-2">
              <AppLogo size="xs" className="shadow-sm shadow-primary/15" />
              <span className="font-display text-[11px] font-bold">
                ConfigVault
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 rounded-md bg-primary/10 px-2 py-1.5 text-[10px] font-medium text-primary transition-colors duration-200 hover:bg-primary/15">
                <LayoutDashboard className="size-3" />
                Dashboard
              </div>
              <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[10px] text-black/45 transition-colors duration-200 hover:bg-black/[0.04] hover:text-black/60 dark:text-white/45 dark:hover:bg-white/[0.04] dark:hover:text-white/60">
                <FolderKanban className="size-3" />
                Projects
              </div>
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1 bg-[oklch(0.975_0.003_210)] p-4 dark:bg-[oklch(0.155_0.013_225)] sm:p-5">
            {/* Stat cards */}
            <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  onMouseEnter={() => setHoveredCard(stat.label)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={cn(
                    "rounded-lg border border-black/[0.06] bg-white p-2.5 shadow-sm shadow-black/[0.04] transition-all duration-250 dark:border-white/[0.07] dark:bg-white/[0.04] dark:shadow-none sm:p-3",
                    hoveredCard === stat.label &&
                      "scale-[1.03] border-primary/20 shadow-md shadow-primary/[0.06] dark:border-primary/20 dark:shadow-primary/[0.04]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] tracking-wide text-black/50 uppercase dark:text-white/50">
                      {stat.label}
                    </span>
                    <stat.icon
                      className={cn(
                        "size-3 transition-transform duration-250",
                        stat.color,
                        hoveredCard === stat.label && "scale-110"
                      )}
                    />
                  </div>
                  <div className="mt-1 font-display text-lg font-bold leading-none">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Project cards */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
              {projects.map((project) => (
                <div
                  key={project.name}
                  onMouseEnter={() => setHoveredCard(project.name)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={cn(
                    "rounded-lg border border-black/[0.06] bg-white p-2.5 shadow-sm shadow-black/[0.04] transition-all duration-250 dark:border-white/[0.07] dark:bg-white/[0.04] dark:shadow-none sm:p-3",
                    hoveredCard === project.name &&
                      "-translate-y-0.5 border-primary/20 shadow-md shadow-primary/[0.06] dark:border-primary/20 dark:shadow-primary/[0.04]"
                  )}
                >
                  <div className="mb-2 font-display text-[11px] font-semibold">
                    {project.name}
                  </div>
                  <div className="flex gap-1.5">
                    {project.envs.map((env) => (
                      <span
                        key={env}
                        className={cn(
                          "rounded px-1.5 py-0.5 text-[8px] font-semibold transition-transform duration-200",
                          hoveredCard === project.name && "scale-105",
                          env === "DEV" &&
                            "bg-blue-500/15 text-blue-600 dark:bg-blue-400/15 dark:text-blue-400",
                          env === "STG" &&
                            "bg-amber-500/15 text-amber-600 dark:bg-amber-400/15 dark:text-amber-400",
                          env === "PROD" &&
                            "bg-emerald-500/15 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-400"
                        )}
                      >
                        {env}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-[9px] text-black/40 dark:text-white/40">
                    <KeyRound className="size-2.5" />
                    {project.secrets} secrets
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
