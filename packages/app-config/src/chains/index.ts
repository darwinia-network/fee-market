import type { EthChainConfig, PolkadotChainConfig, FeeMarketEthChain, FeeMarketPolkadotChain } from "./types";

// Eth
import goerli from "./goerli";
import ethereum from "./ethereum";
import pangoroSmartChain from "./pangoroSmartChain";
import darwiniaSmartChain from "./darwiniaSmartChain";

// Polkadot
import crab from "./crab";
import darwinia from "./darwinia";
import pangolin from "./pangolin";
import pangoro from "./pangoro";
import crabParachain from "./crabParachain";
import pangolinParachain from "./pangolinParachain";

export * from "./types";
export * from "./config";

export const ETH_CHAIN_CONF: Record<FeeMarketEthChain, EthChainConfig> = {
  Goerli: goerli,
  Ethereum: ethereum,
  "Pangoro Smart Chain": pangoroSmartChain,
  "Darwinia Smart Chain": darwiniaSmartChain,
};

export const POLKADOT_CHAIN_CONF: Record<FeeMarketPolkadotChain, PolkadotChainConfig> = {
  Crab: crab,
  Darwinia: darwinia,
  Pangolin: pangolin,
  Pangoro: pangoro,
  "Crab Parachain": crabParachain,
  "Pangolin Parachain": pangolinParachain,
};
