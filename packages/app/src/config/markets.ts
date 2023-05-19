import type { NetworkType, FeeMarketChain } from "../types";

export const markets: Record<NetworkType, { source: FeeMarketChain; destinations: FeeMarketChain[] }[]> = {
  live: [
    { source: "Ethereum", destinations: ["Darwinia Smart Chain"] },
    { source: "Darwinia Smart Chain", destinations: ["Ethereum"] },
    { source: "Darwinia", destinations: ["Crab"] },
    { source: "Crab", destinations: ["Darwinia", "Crab Parachain"] },
    { source: "Crab Parachain", destinations: ["Crab"] },
  ],
  test: [
    { source: "Goerli", destinations: ["Pangoro Smart Chain"] },
    { source: "Pangoro Smart Chain", destinations: ["Goerli"] },
    { source: "Pangoro", destinations: ["Pangolin"] },
    { source: "Pangolin", destinations: ["Pangoro", "Pangolin Parachain"] },
    { source: "Pangolin Parachain", destinations: ["Pangolin"] },
  ],
};
