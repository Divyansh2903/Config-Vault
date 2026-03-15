import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans, Geist_Mono, Roboto } from "next/font/google";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "ConfigVault",
  description: "Secure Developer Secrets & Config Hub",
  openGraph: {
    title: "ConfigVault",
    description: "Manage secrets & config across environments. Secure sharing, audit logs, and access control for your team.",
    siteName: "ConfigVault",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ConfigVault",
    description: "Manage secrets & config across environments. Secure sharing, audit logs, and access control for your team.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${plusJakarta.variable} ${geistMono.variable} ${roboto.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <TooltipProvider>
            {children}
          </TooltipProvider>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
