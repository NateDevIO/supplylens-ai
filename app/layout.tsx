import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"
  ),
  title: "SupplyLens AI | Supply Chain Intelligence",
  description:
    "GenAI-powered supply chain disruption scenario planner. Analyze hurricanes, port congestion, trade conflicts and more across 45 active shipments with real-time AI intelligence.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "SupplyLens AI",
    description:
      "AI-powered supply chain disruption scenario planner for enterprise logistics teams",
    type: "website",
    siteName: "SupplyLens AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "SupplyLens AI",
    description:
      "AI-powered supply chain disruption scenario planner for enterprise logistics teams",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head />
      <body className="font-sans bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
