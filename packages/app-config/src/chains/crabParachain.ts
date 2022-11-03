import type { PolkadotChainConfig } from "./types";
import chainLogo from "../images/network/crab.svg";

const config: PolkadotChainConfig = {
  chainName: "Crab Parachain",
  displayName: "Crab Parachain",
  chainLogo,
  provider: {
    rpc: "wss://crab-parachain-rpc.darwinia.network/",
  },
  graphql: {
    endpoint: "https://subql.darwinia.network/subql-apps-crab-parachain",
  },
  nativeToken: {
    symbol: "CRAB",
    decimals: 18,
  },
  explorer: {
    url: "https://crab-parachain.subscan.io/",
  },
};

export default config;
