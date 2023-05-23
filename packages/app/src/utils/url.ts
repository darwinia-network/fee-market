import { lowerCase } from "lodash";
import { FEE_MARKET_ETH_CHAINS, FEE_MARKET_POLKADOT_CHAINS } from "../config";
import type { FeeMarketChain } from "../types";

const SEARCH_PARAM_CHAIN_FROM_URL = {} as Record<string, FeeMarketChain>;
const SEARCH_PARAM_CHAIN_TO_URL = {} as Record<FeeMarketChain, string>;

FEE_MARKET_ETH_CHAINS.forEach((chain) => {
  SEARCH_PARAM_CHAIN_FROM_URL[lowerCase(chain).replace(/\s/g, "-")] = chain;
});
FEE_MARKET_POLKADOT_CHAINS.forEach((chain) => {
  SEARCH_PARAM_CHAIN_FROM_URL[lowerCase(chain).replace(/ /g, "-")] = chain;
});

FEE_MARKET_ETH_CHAINS.forEach((chain) => {
  SEARCH_PARAM_CHAIN_TO_URL[chain] = lowerCase(chain).replace(/\s/g, "-");
});
FEE_MARKET_POLKADOT_CHAINS.forEach((chain) => {
  SEARCH_PARAM_CHAIN_TO_URL[chain] = lowerCase(chain).replace(/ /g, "-");
});

export const parseUrlChainName = (chainName: string): FeeMarketChain | undefined => {
  return SEARCH_PARAM_CHAIN_FROM_URL[chainName];
};

export const formatUrlChainName = (chainName: FeeMarketChain): string => {
  return SEARCH_PARAM_CHAIN_TO_URL[chainName];
};
