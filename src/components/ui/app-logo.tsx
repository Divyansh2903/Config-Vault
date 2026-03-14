import { cn } from "@/lib/utils";

/**
 * ConfigVault logo mark — shield with keyhole.
 * Sizes: "xs" (20px), "sm" (28px), "md" (32px), "lg" (36px)
 */
export function AppLogo({
  size = "md",
  className,
}: {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeMap = {
    xs: { box: "size-5", svg: 12, radius: "rounded-md" },
    sm: { box: "size-7", svg: 16, radius: "rounded-lg" },
    md: { box: "size-8", svg: 18, radius: "rounded-lg" },
    lg: { box: "size-9", svg: 20, radius: "rounded-xl" },
  };

  const s = sizeMap[size];

  return (
    <div
      className={cn(
        "relative flex items-center justify-center bg-linear-to-br from-primary to-primary/80 shadow-md shadow-primary/25",
        s.box,
        s.radius,
        className
      )}
    >
      {/* Gloss overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-linear-to-b from-white/20 to-transparent",
          s.radius
        )}
      />
      {/* Shield + keyhole SVG */}
      <svg
        width={s.svg}
        height={s.svg}
        viewBox="0 0 24 24"
        fill="none"
        className="relative"
      >
        <path
          d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
          stroke="rgba(255,255,255,0.95)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="11" r="1.5" fill="rgba(255,255,255,0.95)" />
        <path
          d="M12 12.5v3"
          stroke="rgba(255,255,255,0.95)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
