import { providers } from "ethers";
import { ApiPromise } from "@polkadot/api";
import { FEE_MARKET_API_SECTIONS } from "../config";
import type { FeeMarketApiSection } from "../config";
import type { RuntimeVersion } from "@polkadot/types/interfaces";
import type { FeeMarketPolkadotChain } from "../types";

export const isEthApi = (api: unknown): api is providers.Web3Provider => {
  return (
    api instanceof providers.Provider ||
    api instanceof providers.Web3Provider ||
    api instanceof providers.JsonRpcProvider ||
    api instanceof providers.WebSocketProvider
  );
};

export const isPolkadotApi = (api: unknown): api is ApiPromise => {
  return api instanceof ApiPromise;
};

export const getFeeMarketApiSection = (
  api: ApiPromise,
  destination: FeeMarketPolkadotChain
): FeeMarketApiSection | null => {
  const { specName } = api.consts.system.version as RuntimeVersion;
  const source = specName.toString() as FeeMarketPolkadotChain;

  if (FEE_MARKET_API_SECTIONS[source] && FEE_MARKET_API_SECTIONS[source][destination]) {
    const sections = FEE_MARKET_API_SECTIONS[source][destination];
    for (const section of sections) {
      if (api.consts[section] && api.query[section]) {
        return section;
      }
    }
  }

  return null;
};
