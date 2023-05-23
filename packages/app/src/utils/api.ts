import { ApiPromise } from "@polkadot/api";
import { FEE_MARKET_API_SECTIONS } from "../config";
import type { RuntimeVersion } from "@polkadot/types/interfaces";
import type { FeeMarketPolkadotChain, FeeMarketApiSection } from "../types";
import type { WalletClient } from "wagmi";
import { ethers } from "ethers";

export const isEthersApi = (api: unknown): api is ethers.providers.Web3Provider => {
  return (
    api instanceof ethers.providers.Provider ||
    api instanceof ethers.providers.Web3Provider ||
    api instanceof ethers.providers.JsonRpcProvider ||
    api instanceof ethers.providers.WebSocketProvider
  );
};

export const isWalletClient = (api?: unknown): api is WalletClient => {
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
