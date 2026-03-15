import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "ConfigVault - Secure Developer Secrets & Config Hub";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #0a0f0d 0%, #0d1117 30%, #0a0f0d 60%, #111827 100%)",
          position: "relative",
          overflow: "hidden",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Background glow effects */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-80px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-150px",
            left: "-100px",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "800px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(16, 185, 129, 0.06) 0%, transparent 60%)",
            display: "flex",
          }}
        />

        {/* Grid pattern overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            display: "flex",
          }}
        />

        {/* Top border accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, transparent, #10b981, #34d399, #10b981, transparent)",
            display: "flex",
          }}
        />

        {/* Content container */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            zIndex: 10,
          }}
        >
          {/* Logo / Icon */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "80px",
              height: "80px",
              borderRadius: "20px",
              background: "linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05))",
              border: "1.5px solid rgba(16, 185, 129, 0.3)",
              marginBottom: "8px",
            }}
          >
            {/* Shield + Lock icon */}
            <svg
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#34d399"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <rect x="9" y="10" width="6" height="5" rx="1" />
              <path d="M10 10V8a2 2 0 1 1 4 0v2" />
            </svg>
          </div>

          {/* Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 18px",
              borderRadius: "100px",
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              fontSize: "14px",
              color: "#34d399",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#10b981",
                display: "flex",
              }}
            />
            Secure Config For Teams
          </div>

          {/* App name */}
          <div
            style={{
              fontSize: "72px",
              fontWeight: 800,
              color: "#f0fdf4",
              letterSpacing: "-2px",
              lineHeight: 1.1,
              display: "flex",
              alignItems: "baseline",
              gap: "4px",
            }}
          >
            Config
            <span
              style={{
                background: "linear-gradient(135deg, #10b981, #34d399, #6ee7b7)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Vault
            </span>
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: "24px",
              color: "rgba(209, 213, 219, 0.8)",
              fontWeight: 400,
              letterSpacing: "0.5px",
              marginTop: "4px",
              display: "flex",
            }}
          >
            Manage secrets & config across environments
          </div>

          {/* Feature pills */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "28px",
            }}
          >
            {["Env Variables", "Team Sharing", "Audit Logs", "Access Control"].map(
              (label) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 20px",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    fontSize: "15px",
                    color: "rgba(209, 213, 219, 0.7)",
                    fontWeight: 500,
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {label}
                </div>
              )
            )}
          </div>
        </div>

        {/* Bottom border accent */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: "linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.3), rgba(16, 185, 129, 0.3), transparent)",
            display: "flex",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
