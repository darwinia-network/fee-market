import type { ContractInterface } from "ethers";
import { FEE_MARKET_ETH_CHAINS, FEE_MARKET_POLKADOT_CHAINS } from "../config/constant";

export type FeeMarketEthChain = typeof FEE_MARKET_ETH_CHAINS[number];
export type FeeMarketPolkadotChain = typeof FEE_MARKET_POLKADOT_CHAINS[number];

export type FeeMarketChain = FeeMarketPolkadotChain | FeeMarketEthChain;

export interface ChainConfig {
  chainName: FeeMarketChain; // Can use as id
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
  chainId: number;
  chainName: FeeMarketEthChain;
  contractAddress: `0x${string}`;
  contractInterface: ContractInterface;
  isSmartChain?: boolean;
}
