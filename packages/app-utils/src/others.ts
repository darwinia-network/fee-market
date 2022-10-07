import { MARKET_API_SECTIONS } from "@feemarket/app-config";
import { providers } from "ethers";
import { ApiPromise } from "@polkadot/api";
import { ALL_FEE_MARKET_ETH_CHAINS, ALL_FEE_MARKET_POLKADOT_CHAINS } from "@feemarket/app-types";
import type {
  FeeMarketApiSection,
  FeeMarketEthChain,
  FeeMarketPolkadotChain,
  RuntimeVersion,
} from "@feemarket/app-types";

export const getFeeMarketApiSection = (
  api: ApiPromise,
  destination: FeeMarketPolkadotChain
): FeeMarketApiSection | null => {
  const { specName } = api.consts.system.version as RuntimeVersion;
  const source = specName.toString() as FeeMarketPolkadotChain;

  if (MARKET_API_SECTIONS[source] && MARKET_API_SECTIONS[source][destination]) {
    const sections = MARKET_API_SECTIONS[source][destination];
    for (const section of sections) {
      if (api.consts[section] && api.query[section]) {
        return section;
      }
    }
  }

  return null;
};

export const getPolkadotMarkets = () => {
  const markets = {} as Record<FeeMarketPolkadotChain, FeeMarketPolkadotChain[]>;

  const sources = Object.keys(MARKET_API_SECTIONS) as FeeMarketPolkadotChain[];
  for (const source of sources) {
    markets[source] = Object.keys(MARKET_API_SECTIONS[source]) as FeeMarketPolkadotChain[];
  }

  return markets;
};

export const isEthApi = (api: unknown): api is providers.Web3Provider => {
  return api instanceof providers.Web3Provider;
};

export const isPolkadotApi = (api: unknown): api is ApiPromise => {
  return api instanceof ApiPromise;
};

export const isEthChain = (chainName: unknown): chainName is FeeMarketEthChain => {
  return ALL_FEE_MARKET_ETH_CHAINS.includes(chainName as FeeMarketEthChain);
};

export const isPolkadotChain = (chainName: unknown): chainName is FeeMarketPolkadotChain => {
  return ALL_FEE_MARKET_POLKADOT_CHAINS.includes(chainName as FeeMarketPolkadotChain);
};
