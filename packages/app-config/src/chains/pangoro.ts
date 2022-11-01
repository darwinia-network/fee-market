import type { PolkadotChainConfig } from "./types";
import chainLogo from "../images/network/pangoro.svg";

const config: PolkadotChainConfig = {
  chainName: "Pangoro",
  displayName: "Pangoro Chain",
  chainLogo,
  provider: {
    rpc: "wss://pangoro-rpc.darwinia.network",
  },
  graphql: {
    endpoint: "https://subql.darwinia.network/subql-apps-pangoro/",
  },
  nativeToken: {
    symbol: "ORING",
    decimals: 9,
  },
  explorer: {
    url: "https://pangoro.subscan.io/",
  },
};

export default config;
