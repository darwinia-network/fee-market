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
