// specName
export type FeeMarketPolkadotChain =
  | "Crab"
  | "Darwinia"
  | "Pangolin"
  | "Pangoro"
  | "Crab Parachain"
  | "Darwinia Parachain"
  | "Pangolin Parachain";

export type FeeMarketEthChain =
  | "Ethereum"
  | "Crab Smart Chain"
  | "Darwinia Smart Chain"
  | "Pangolin Smart Chain"
  | "Pangoro Smart Chain";

export type FeeMarketChain = FeeMarketPolkadotChain | FeeMarketEthChain;
