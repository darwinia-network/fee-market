import type { PolkadotChainConfig } from "../../types/chain";
import chainLogo from "../../assets/images/network/pangolin.svg";

const config: PolkadotChainConfig = {
  chainName: "Pangolin",
  displayName: "Pangolin Chain",
  chainLogo,
  provider: {
    rpc: "wss://pangolin-rpc.darwinia.network",
  },
  graphql: {
    endpoint: "https://subql.darwinia.network/subql-apps-pangolin/",
  },
  nativeToken: {
    symbol: "PRING",
    decimals: 9,
  },
  explorer: {
    url: "https://pangolin.subscan.io/",
    name: "Subscan",
  },
};

export default config;
