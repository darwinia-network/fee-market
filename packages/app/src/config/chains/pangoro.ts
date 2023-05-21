import type { PolkadotChainConfig } from "../../types/chain";
import chainLogo from "../../assets/images/network/pangoro.svg";

const config: PolkadotChainConfig = {
  chainName: "Pangoro",
  displayName: "Pangoro Chain",
  chainLogo,
  provider: {
    rpc: "wss://pangoro-rpc.darwinia.network",
  },
  graphql: {
    endpoint: "https://subql.darwinia.network/subql-apps-pangoro/",
  },
  nativeToken: {
    symbol: "ORING",
    decimals: 9,
  },
  explorer: {
    url: "https://pangoro.subscan.io/",
    name: "Subscan",
  },
};

export default config;
