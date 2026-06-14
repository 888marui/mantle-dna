import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mantle DNA - Decentralized Genomic Data Platform",
  description:
    "Own your genetic data. Share it on your terms. Earn rewards for contributing to science. Built on Mantle Network.",
  openGraph: {
    title: "Mantle DNA",
    description: "Decentralized Genomic Data Ownership on Mantle Network",
    images: ["/og-image.png"],
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
