import type { Metadata, Viewport } from "next";
import { Inter, Anton } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/providers/SmoothScroll";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://jawadshalhoub.com"),
  title: "Jawad Shalhoub — Two Continents. Two Summits. One World Record.",
  description:
    "Jawad Shalhoub is a 23-year-old Lebanese adventurer preparing for a world-first two-continent summit challenge — climbing Mount Kilimanjaro in Africa and Mount Elbrus in Europe in record time.",
  openGraph: {
    title: "Jawad Shalhoub — Two Continents. Two Summits. One World Record.",
    description:
      "Jawad Shalhoub is a 23-year-old Lebanese adventurer preparing for a world-first two-continent summit challenge — climbing the highest peaks of Africa and Europe in record time.",
    type: "website",
    locale: "en",
    images: ["/media/video/IMG_6116-poster.webp"],
  },
};

export const viewport: Viewport = {
  themeColor: "#07090c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body
        className={`${inter.variable} ${anton.variable} min-h-full flex flex-col`}
      >
        {/* Skip link — visually hidden until focused, for keyboard users. */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-lebanon-red focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:uppercase focus:tracking-wider focus:text-snow focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-snow focus:ring-offset-2 focus:ring-offset-ink"
        >
          Skip to content
        </a>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
