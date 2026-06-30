import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import PWARegister from "@/components/PWARegister";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Licensed to Glow — One membership for your beauty life",
    template: "%s · Licensed to Glow",
  },
  description:
    "A curated membership for premium salons, spas, clinics, nail studios and wellness providers worth returning to. Discover, book and track your glow-up.",
  keywords: [
    "beauty membership",
    "salon booking",
    "spa membership",
    "ClassPass for beauty",
    "facials",
    "nails",
    "wellness",
  ],
  applicationName: "Licensed to Glow",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Glow",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#2b2118",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${inter.variable} ${fraunces.variable} min-h-full flex flex-col antialiased`}
      >
        {children}
        <PWARegister />
      </body>
    </html>
  );
}
