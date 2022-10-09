import type { ContractInterface } from "ethers";

// Customized
export const ALL_FEE_MARKET_ETH_CHAINS = [
  "Goerli",
  "Ethereum",
  "Crab Smart Chain",
  "Darwinia Smart Chain",
  "Pangolin Smart Chain",
  "Pangoro Smart Chain",
] as const;

// Substrate specName
export const ALL_FEE_MARKET_POLKADOT_CHAINS = [
  "Crab",
  "Darwinia",
  "Pangolin",
  "Pangoro",
  "Crab Parachain",
  "Darwinia Parachain",
  "Pangolin Parachain",
] as const;

export type FeeMarketEthChain = typeof ALL_FEE_MARKET_ETH_CHAINS[number];
export type FeeMarketPolkadotChain = typeof ALL_FEE_MARKET_POLKADOT_CHAINS[number];

export type FeeMarketSourceChainEth = Extract<
  FeeMarketEthChain,
  "Goerli" | "Pangoro Smart Chain" | "Ethereum" | "Darwinia Smart Chain"
>;
export type FeeMarketSourceChainPolkadot = Extract<
  FeeMarketPolkadotChain,
  "Crab" | "Darwinia" | "Pangolin" | "Pangoro"
>;
export type FeeMarketSourceChan = FeeMarketSourceChainEth | FeeMarketSourceChainPolkadot;

export type FeeMarketChain = FeeMarketPolkadotChain | FeeMarketEthChain;

export enum ChainID {
  ETHEREUM = 1,
  GOERLI = 5,
  CRAB_SMART_CHAIN = 44,
  DARWINIA_SMART_CHAIN = 46,
  PANGOLIN_SMART_CHAIN = 43,
  PANGORO_SMART_CHAIN = 45,
}

export interface ChainConfig {
  chainName: FeeMarketChain;
  displayName: string;
  chainLogo: string;
  graphql: {
    endpoint: string;
  };
  nativeToken: {
    symbol: string;
    decimals: number;
  };
  explorer: {
    url: string;
  };
  provider: {
    rpc: string;
  };
}

export interface PolkadotChainConfig extends ChainConfig {
  chainName: FeeMarketPolkadotChain;
}

export interface EthChainConfig extends ChainConfig {
  chainId: ChainID;
  chainName: FeeMarketEthChain;
  contractAddress: string;
  contractInterface: ContractInterface;
}
