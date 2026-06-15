import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mantle DNA — Discover Your On-Chain Identity",
  description:
    "AI-powered wallet DNA profiler on Mantle Network. Real ERC-20 data, 7 archetypes, Mantle Ecosystem Score, DNA Evolution Path — mint as a Soulbound NFT.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  ),
  openGraph: {
    title: "Mantle DNA — Discover Your On-Chain Identity",
    description:
      "Real ERC-20 data · 7 archetypes · Mantle Ecosystem Score · DNA Evolution Path · Soulbound NFT",
    type: "website",
    siteName: "Mantle DNA",
    images: [{ url: "/api/og?landing=true", width: 1200, height: 630, alt: "Mantle DNA — 7 On-chain Archetypes" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mantle DNA — On-Chain Identity",
    description: "Discover your wallet's DNA on Mantle Network — real token data, AI insights, Mantle Ecosystem Score",
    images: ["/api/og?landing=true"],
  },
  keywords: [
    "Mantle Network", "Mantle DNA", "Web3 identity", "NFT", "DeFi",
    "wallet analysis", "AI", "Soulbound NFT", "on-chain personality",
    "mETH", "Agni Finance", "DNA archetype", "Mantle Ecosystem Score",
    "wallet comparison", "DNA comparison", "on-chain identity", "Mantle Sepolia",
  ],
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
