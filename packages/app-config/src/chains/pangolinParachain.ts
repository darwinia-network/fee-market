import type { PolkadotChainConfig } from "@feemarket/app-types";
import chainLogo from "../images/network/pangolin.svg";

const config: PolkadotChainConfig = {
  chainName: "Pangolin Parachain",
  displayName: "Pangolin Parachain Chain",
  chainLogo: chainLogo,
  provider: {
    rpc: "wss://pangolin-parachain-rpc.darwinia.network",
  },
  graphql: {
    endpoint: "",
  },
  nativeToken: {
    symbol: "PRING",
    decimals: 9,
  },
  explorer: {
    url: "https://pangolin-parachain.subscan.io/",
  },
};

export default config;
