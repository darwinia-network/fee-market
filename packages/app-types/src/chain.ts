// specName
export type FeeMarketPolkadotChain =
  | "Crab"
  | "Darwinia"
  | "Pangolin"
  | "Pangoro"
  | "Crab Parachain"
  | "Darwinia Parachain"
  | "Pangolin Parachain";

// TODO
export type FeeMarketEthChain = "";

export type FeeMarketChain = FeeMarketPolkadotChain | FeeMarketEthChain;
