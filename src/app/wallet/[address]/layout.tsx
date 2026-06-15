import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { address: string };
}): Promise<Metadata> {
  const { address } = params;
  const short = `${address.slice(0, 10)}...${address.slice(-8)}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mantle-dna.vercel.app";
  const ogUrl = `${appUrl}/api/og?address=${address}`;

  return {
    title: `${short} — Mantle DNA`,
    description: `Discover the on-chain DNA of ${short} on Mantle Network`,
    openGraph: {
      title: `${short} — Mantle DNA`,
      description: "Discover on-chain wallet DNA on Mantle Network",
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${short} — Mantle DNA`,
      images: [ogUrl],
    },
  };
}

export default function WalletLayout({ children }: { children: React.ReactNode }) {
  return children;
}
