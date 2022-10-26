import type { PolkadotChainConfig } from "@feemarket/app-types";
import chainLogo from "../images/network/pangolin.svg";

const config: PolkadotChainConfig = {
  chainName: "Pangolin Parachain",
  displayName: "Pangolin Parachain",
  chainLogo: chainLogo,
  provider: {
    rpc: "wss://pangolin-parachain-rpc.darwinia.network",
  },
  graphql: {
    endpoint: "",
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
