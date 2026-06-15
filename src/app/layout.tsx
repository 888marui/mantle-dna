import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mantle DNA — Discover Your On-Chain Identity",
  description:
    "AI-powered wallet personality analysis on Mantle Network. Discover your on-chain DNA and mint it as a Soulbound NFT.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"
  ),
  openGraph: {
    title: "Mantle DNA — Discover Your On-Chain Identity",
    description:
      "AI-powered wallet personality analysis. 7 archetypes. Soulbound NFT.",
    type: "website",
    siteName: "Mantle DNA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mantle DNA",
    description: "Discover your on-chain DNA on Mantle Network",
  },
  keywords: [
    "Mantle",
    "Web3",
    "NFT",
    "DeFi",
    "wallet",
    "AI",
    "Soulbound",
    "DNA",
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
