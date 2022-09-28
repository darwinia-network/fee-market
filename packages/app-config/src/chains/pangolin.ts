import type { PolkadotChainConfig } from "@feemarket/app-types";
import PangolinLogo from "../images/network/pangolin.svg";

const config: PolkadotChainConfig = {
  chainName: "Pangolin",
  chainLogo: PangolinLogo,
  rpcUrl: "https://pangolin-rpc.darwinia.network/",
  graphql: {
    endpoint: "https://subql.darwinia.network/subql-apps-pangolin/",
  },
};

export default config;