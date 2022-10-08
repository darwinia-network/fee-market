import { lowerCase } from "lodash";
import { ALL_FEE_MARKET_ETH_CHAINS, ALL_FEE_MARKET_POLKADOT_CHAINS } from "@feemarket/app-types";
import type { FeeMarketApiSection, FeeMarketPolkadotChain, FeeMarketChain } from "@feemarket/app-types";

export const MARKET_API_SECTIONS = {
  Crab: {
    Darwinia: ["feeMarket", "darwiniaFeeMarket"],
    "Crab Parachain": ["crabParachainFeeMarket"],
  },
  Darwinia: {
    Crab: ["feeMarket", "crabFeeMarket"],
  },
  Pangolin: {
    Pangoro: ["feeMarket", "pangoroFeeMarket"],
    "Pangolin Parachain": ["pangolinParachainFeeMarket"],
  },
  Pangoro: {
    Pangolin: ["feeMarket", "pangolinFeeMarket"],
  },
} as Record<FeeMarketPolkadotChain, Record<FeeMarketPolkadotChain, FeeMarketApiSection[]>>;

const MAPPING_URL_SEARCH_PARAM_2_CHAIN = {} as Record<string, FeeMarketChain>;
ALL_FEE_MARKET_ETH_CHAINS.forEach((chain) => {
  MAPPING_URL_SEARCH_PARAM_2_CHAIN[lowerCase(chain).replace(/\s/g, "-")] = chain;
});
ALL_FEE_MARKET_POLKADOT_CHAINS.forEach((chain) => {
  MAPPING_URL_SEARCH_PARAM_2_CHAIN[lowerCase(chain).replace(/ /g, "-")] = chain;
});
export { MAPPING_URL_SEARCH_PARAM_2_CHAIN };

const MAPPING_CHAIN_2_URL_SEARCH_PARAM = {} as Record<FeeMarketChain, string>;
ALL_FEE_MARKET_ETH_CHAINS.forEach((chain) => {
  MAPPING_CHAIN_2_URL_SEARCH_PARAM[chain] = lowerCase(chain).replace(/\s/g, "-");
});
ALL_FEE_MARKET_POLKADOT_CHAINS.forEach((chain) => {
  MAPPING_CHAIN_2_URL_SEARCH_PARAM[chain] = lowerCase(chain).replace(/ /g, "-");
});
export { MAPPING_CHAIN_2_URL_SEARCH_PARAM };
