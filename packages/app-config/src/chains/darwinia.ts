import type { PolkadotChainConfig } from "@feemarket/app-types";
import DarwiniaLogo from "../images/network/darwinia.svg";

const config: PolkadotChainConfig = {
  chainName: "Darwinia",
  chainLogo: DarwiniaLogo,
  rpcUrl: "https://rpc.darwinia.network/",
  graphql: {
    endpoint: "https://subql.darwinia.network/subql-apps-darwinia/",
  },
};

export default config;
