// import type { ContractInterface } from "ethers";
import { FEE_MARKET_ETH_CHAINS, FEE_MARKET_POLKADOT_CHAINS } from "../config/constant";
import { ABI } from "./contract";

export type FeeMarketEthChain = typeof FEE_MARKET_ETH_CHAINS[number];
export type FeeMarketPolkadotChain = typeof FEE_MARKET_POLKADOT_CHAINS[number];

export type FeeMarketChain = FeeMarketPolkadotChain | FeeMarketEthChain;

export interface ChainConfig {
  readonly chainName: FeeMarketChain; // Can use as id
  readonly displayName: string;
  readonly chainLogo: string;
  readonly graphql: {
    readonly endpoint: string;
  };
  readonly nativeToken: {
    readonly symbol: string;
    readonly decimals: number;
  };
  readonly explorer: {
    readonly url: string;
    readonly name: string;
  };
  readonly provider: {
    readonly rpc: string;
  };
}

export interface PolkadotChainConfig extends ChainConfig {
  readonly chainName: FeeMarketPolkadotChain;
}

export interface EthChainConfig extends ChainConfig {
  readonly chainId: number;
  readonly chainName: FeeMarketEthChain;
  readonly contractAddress: `0x${string}`;
  readonly contractInterface: ABI;
  // readonly contractInterface: ContractInterface;
  readonly isSmartChain?: boolean;
}

export type FeeMarketApiSection =
  | "feeMarket"
  | "crabFeeMarket"
  | "darwiniaFeeMarket"
  | "pangolinFeeMarket"
  | "pangoroFeeMarket"
  | "crabParachainFeeMarket"
  | "pangolinParachainFeeMarket";
