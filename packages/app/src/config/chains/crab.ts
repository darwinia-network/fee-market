import type { PolkadotChainConfig } from "../../types/chain";
import chainLogo from "../../assets/images/network/crab.svg";

const config: PolkadotChainConfig = {
  chainName: "Crab",
  displayName: "Crab Chain",
  chainLogo,
  provider: {
    rpc: "wss://crab-rpc.darwinia.network",
  },
  graphql: {
    endpoint: "https://subql.darwinia.network/subql-apps-crab/",
  },
  nativeToken: {
    symbol: "CRAB",
    decimals: 9,
  },
  explorer: {
    url: "https://crab.subscan.io/",
  },
};

export default config;
