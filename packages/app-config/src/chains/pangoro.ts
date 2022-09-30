import type { PolkadotChainConfig } from "@feemarket/app-types";
import PangoroLogo from "../images/network/pangoro.svg";

const config: PolkadotChainConfig = {
  chainName: "Pangoro",
  displayName: "Pangoro Chain",
  chainLogo: PangoroLogo,
  rpcUrl: "https://pangoro-rpc.darwinia.network/",
  graphql: {
    endpoint: "https://subql.darwinia.network/subql-apps-pangoro/",
  },
  isTestNet: true,
};

export default config;
