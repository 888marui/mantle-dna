import type { Metadata } from "next";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { address: string };
  searchParams: { [key: string]: string | string[] | undefined };
}): Promise<Metadata> {
  const { address } = params;
  const short = `${address.slice(0, 10)}...${address.slice(-8)}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mantle-dna.xyz";

  // Pass score params through to OG image so shared links show accurate data
  const ogParams = new URLSearchParams({ address });
  const passThrough = ["archetype", "defi", "hodl", "diversity", "activity", "network", "mantleScore"];
  passThrough.forEach((key) => {
    const v = searchParams[key];
    if (v && typeof v === "string") ogParams.set(key, v);
  });
  const ogUrl = `${appUrl}/api/og?${ogParams.toString()}`;

  const network = searchParams.network === "mainnet" ? "Mainnet" : "Sepolia";

  return {
    title: `${short} — Mantle DNA Certificate`,
    description: `On-chain DNA profile for ${short} on Mantle ${network} — archetype, Mantle Ecosystem Score, AI insights, and DNA Evolution Path.`,
    openGraph: {
      title: `${short} — Mantle DNA`,
      description: "On-chain DNA profile: archetype, Mantle Ecosystem Score, AI insights, and DNA Evolution Path.",
      images: [{ url: ogUrl, width: 1200, height: 630, alt: `DNA Certificate for ${short}` }],
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: `${short} — Mantle DNA`,
      description: "On-chain DNA profile on Mantle Network",
      images: [ogUrl],
    },
  };
}

export default function WalletLayout({ children }: { children: React.ReactNode }) {
  return children;
}
