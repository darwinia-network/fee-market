import type { FeeMarketEthChain, FeeMarketPolkadotChain } from "@feemarket/config";
import {
  FEE_MARKET_ETH_CHAINS,
  FEE_MARKET_POLKADOT_CHAINS,
  ETH_CHAIN_CONF,
  POLKADOT_CHAIN_CONF,
} from "@feemarket/config";

export const isEthChain = (chainName: unknown): chainName is FeeMarketEthChain => {
  return FEE_MARKET_ETH_CHAINS.includes(chainName as FeeMarketEthChain);
};

export const isPolkadotChain = (chainName: unknown): chainName is FeeMarketPolkadotChain => {
  return FEE_MARKET_POLKADOT_CHAINS.includes(chainName as FeeMarketPolkadotChain);
};

export const getEthChainConfig = (chainName: FeeMarketEthChain) => {
  return ETH_CHAIN_CONF[chainName];
};

export const getPolkadotChainConfig = (chainName: FeeMarketPolkadotChain) => {
  return POLKADOT_CHAIN_CONF[chainName];
};
