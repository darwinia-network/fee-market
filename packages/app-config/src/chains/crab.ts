import type { PolkadotChainConfig } from "@feemarket/app-types";
import CrabLogo from "../images/network/crab.svg";

const config: PolkadotChainConfig = {
  chainName: "Crab",
  displayName: "Crab Chain",
  chainLogo: CrabLogo,
  rpcUrl: "https://crab-rpc.darwinia.network/",
  graphql: {
    endpoint: "https://subql.darwinia.network/subql-apps-crab/",
  },
};

export default config;
