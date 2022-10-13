import type { PolkadotChainConfig } from "@feemarket/app-types";
import chainLogo from "../images/network/crab.svg";

const config: PolkadotChainConfig = {
  chainName: "Crab Parachain",
  displayName: "Crab Parachain",
  chainLogo: chainLogo,
  provider: {
    rpc: "wss://crab-parachain-rpc.darwinia.network/",
  },
  graphql: {
    endpoint: "",
  },
  nativeToken: {
    symbol: "CRAB",
    decimals: 9,
  },
  explorer: {
    url: "https://crab-parachain.subscan.io/",
  },
};

export default config;
