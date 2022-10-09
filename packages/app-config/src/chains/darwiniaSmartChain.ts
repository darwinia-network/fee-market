import type { EthChainConfig } from "@feemarket/app-types";
import { ChainID } from "@feemarket/app-types";
import chainLogo from "../images/network/darwinia.svg";
import contractInterface from "../abi/eth.json";

const config: EthChainConfig = {
  chainId: ChainID.DARWINIA_SMART_CHAIN,
  chainName: "Darwinia Smart Chain",
  displayName: "Darwinia Smart Chain",
  chainLogo,
  graphql: {
    endpoint: "",
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
};

export default config;
