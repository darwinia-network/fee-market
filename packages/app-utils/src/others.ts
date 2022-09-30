import { MARKET_API_SECTIONS } from "@feemarket/app-config";
import type { ApiPromise, FeeMarketApiSection, FeeMarketPolkadotChain, RuntimeVersion } from "@feemarket/app-types";

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
