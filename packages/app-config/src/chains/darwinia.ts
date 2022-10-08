import type { PolkadotChainConfig } from "@feemarket/app-types";
import DarwiniaLogo from "../images/network/darwinia.svg";

const config: PolkadotChainConfig = {
  chainName: "Darwinia",
  displayName: "Darwinia Chain",
  chainLogo: DarwiniaLogo,
  provider: {
    rpc: "wss://rpc.darwinia.network",
  },
  graphql: {
    endpoint: "https://subql.darwinia.network/subql-apps-darwinia/",
  },
  nativeToken: {
    symbol: "RING",
    decimals: 9,
  },
  explorer: {
    url: "https://darwinia.subscan.io/",
  },
};

export default config;
