import type { FeeMarketPolkadotChain, PolkadotChainConfig } from "@feemarket/app-types";

import crab from "./crab";
import darwinia from "./darwinia";
import pangolin from "./pangolin";
import pangoro from "./pangoro";

export const POLKADOT_CHAIN_CONF: Record<
  Extract<FeeMarketPolkadotChain, "Crab" | "Darwinia" | "Pangolin" | "Pangoro">,
  PolkadotChainConfig
> = {
  Crab: crab,
  Darwinia: darwinia,
  Pangolin: pangolin,
  Pangoro: pangoro,
};
