import type { NetworkType, FeeMarketChain } from "../types";

export const markets: Record<NetworkType, { source: FeeMarketChain; destinations: FeeMarketChain[] }[]> = {
  live: [
    { source: "Ethereum", destinations: ["Darwinia"] },
    { source: "Darwinia", destinations: ["Ethereum"] },
  ],
  test: [
    { source: "Goerli", destinations: ["Pangolin"] },
    { source: "Pangolin", destinations: ["Goerli"] },
  ],
};
