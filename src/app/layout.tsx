import type { Metadata, Viewport } from "next";
import { Nunito, Baloo_2 } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";
import { ThemeScript } from "@/components/ThemeScript";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const baloo = Baloo_2({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3100";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Habit Rabbit — a kinder habit tracker",
    template: "%s · Habit Rabbit",
  },
  description:
    "Habit Rabbit is a gentle habit tracker for small daily wins. No streaks, no guilt, no pressure — just a cheerful rabbit cheering you on.",
  applicationName: "Habit Rabbit",
  keywords: [
    "habit tracker",
    "daily habits",
    "no streak habit app",
    "gentle habit tracker",
    "weekly habit report",
    "habit rabbit",
  ],
  authors: [{ name: "Habit Rabbit" }],
  creator: "Habit Rabbit",
  category: "productivity",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Habit Rabbit",
    title: "Habit Rabbit — a kinder habit tracker",
    description:
      "Small daily wins, no streaks to break. Track habits, see your week, and get a positive weekly report only when you ask for one.",
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Habit Rabbit — a pastel habit tracker with a cheerful rabbit mascot",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Habit Rabbit — a kinder habit tracker",
    description: "Small daily wins, no streaks to break. A gentle habit tracker with a cheerful rabbit.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FDF4FF" },
    { media: "(prefers-color-scheme: dark)", color: "#14102B" },
  ],
  width: "device-width",
  initialScale: 1,
};

const umamiId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
const umamiSrc = process.env.NEXT_PUBLIC_UMAMI_SRC ?? "https://cloud.umami.is/script.js";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${nunito.variable} ${baloo.variable}`}>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-dvh font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-rabbit-primary focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:text-white"
        >
          Skip to content
        </a>
        <Providers>{children}</Providers>
        {umamiId && (
          <Script src={umamiSrc} data-website-id={umamiId} strategy="afterInteractive" defer />
        )}
      </body>
    </html>
  );
}
