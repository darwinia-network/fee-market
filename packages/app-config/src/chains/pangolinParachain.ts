import type { PolkadotChainConfig } from "./types";
import chainLogo from "../images/network/pangolin.svg";

const config: PolkadotChainConfig = {
  chainName: "Pangolin Parachain",
  displayName: "Pangolin Parachain",
  chainLogo,
  provider: {
    rpc: "wss://pangolin-parachain-rpc.darwinia.network",
  },
  graphql: {
    endpoint: "https://subql.darwinia.network/subql-apps-pangolin-parachain",
  },
  nativeToken: {
    symbol: "PRING",
    decimals: 18,
  },
  explorer: {
    url: "https://pangolin-parachain.subscan.io/",
  },
};

export default config;
