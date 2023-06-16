import type {
  EthChainConfig,
  PolkadotChainConfig,
  FeeMarketEthChain,
  FeeMarketPolkadotChain,
  ChainConfig,
} from "../../types/chain";

// Eth
import goerli from "./goerli";
import ethereum from "./ethereum";
import pangoro from "./pangoro";
import darwinia from "./darwinia";

// Polkadot
import crabParachain from "./crabParachain";

export const ALL_CHAINS: ChainConfig[] = [goerli, ethereum, darwinia, pangoro];

export const ETH_CHAIN_CONF: Record<FeeMarketEthChain, EthChainConfig> = {
  Goerli: goerli,
  Ethereum: ethereum,
  Darwinia: darwinia,
  Pangoro: pangoro,
};

export const POLKADOT_CHAIN_CONF: Record<FeeMarketPolkadotChain, PolkadotChainConfig> = {
  "Crab Parachain": crabParachain,
};
