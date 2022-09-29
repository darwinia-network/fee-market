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
  rpcUrl: string;
  graphql: {
    endpoint: string;
  };
}

export interface PolkadotChainConfig extends ChainConfig {
  chainName: FeeMarketPolkadotChain;
}

export interface EthChainConfig extends ChainConfig {
  chainId: ChainID;
  chainName: FeeMarketEthChain;
  nativeCurrency: {
    name: string;
    symbol: string; // 2-6 characters long
    decimals: 18;
  };
  blockExplorerUrls?: string[];
}
