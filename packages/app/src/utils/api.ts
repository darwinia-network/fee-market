import { ApiPromise } from "@polkadot/api";
import { FEE_MARKET_API_SECTIONS } from "../config";
import type { RuntimeVersion } from "@polkadot/types/interfaces";
import type { FeeMarketPolkadotChain, FeeMarketApiSection } from "../types";
import type { PublicClient, WalletClient } from "wagmi";

export const isEthApi = (api?: unknown): api is PublicClient | WalletClient => {
  if (api && typeof api === "object" && Object.hasOwn(api, "type")) {
    const { type } = api as { type?: unknown };
    return type === "publicClient" || type === "walletClient";
  }
  return false;
};

export const isEthProviderApi = (api?: unknown): api is PublicClient => {
  if (api && typeof api === "object" && Object.hasOwn(api, "type")) {
    const { type } = api as { type?: unknown };
    return type === "publicClient";
  }
  return false;
};

export const isEthSignerApi = (api?: unknown): api is WalletClient => {
  if (api && typeof api === "object" && Object.hasOwn(api, "type")) {
    const { type } = api as { type?: unknown };
    return type === "walletClient";
  }
  return false;
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
