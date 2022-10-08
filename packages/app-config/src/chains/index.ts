import type {
  EthChainConfig,
  PolkadotChainConfig,
  FeeMarketSourceChainEth,
  FeeMarketSourceChainPolkadot,
} from "@feemarket/app-types";

// Eth
import goerli from "./goerli";

// Polkadot
import crab from "./crab";
import darwinia from "./darwinia";
import pangolin from "./pangolin";
import pangoro from "./pangoro";

export const ETH_CHAIN_CONF: Record<FeeMarketSourceChainEth, EthChainConfig> = {
  Goerli: goerli,
};

export const POLKADOT_CHAIN_CONF: Record<FeeMarketSourceChainPolkadot, PolkadotChainConfig> = {
  Crab: crab,
  Darwinia: darwinia,
  Pangolin: pangolin,
  Pangoro: pangoro,
};
