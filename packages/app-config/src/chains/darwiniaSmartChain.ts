import type { EthChainConfig } from "./types";
import chainLogo from "../images/network/darwinia.svg";
import contractInterface from "../abi/smartChain.json";

const config: EthChainConfig = {
  chainId: 46,
  chainName: "Darwinia Smart Chain",
  displayName: "Darwinia Smart Chain",
  chainLogo,
  graphql: {
    endpoint: "https://thegraph.darwinia.network/feemarket/subgraphs/name/feemarket-darwinia",
  },
  nativeToken: {
    symbol: "RING",
    decimals: 18,
  },
  explorer: {
    url: "https://darwinia.subscan.io/",
  },
  provider: {
    rpc: "https://rpc.darwinia.network/",
  },
  contractAddress: "0xcA927Df15afb7629b79dA4713a871190315c7409",
  contractInterface,
  isSmartChain: true,
};

export default config;
