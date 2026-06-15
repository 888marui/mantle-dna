import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DNA Comparison — Mantle DNA",
  description: "Compare two Mantle wallet DNA profiles side by side. Discover compatibility scores, DNA distance, and archetype dynamics.",
  openGraph: {
    title: "Mantle DNA Comparison",
    description: "Compare two Mantle wallets side by side — DNA compatibility score, score diffs, and archetype analysis.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mantle DNA Comparison",
    description: "Compare two Mantle wallet DNA profiles — compatibility score, DNA distance, on-chain trait analysis.",
  },
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
