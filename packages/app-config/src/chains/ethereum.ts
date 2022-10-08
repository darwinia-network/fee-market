import type { EthChainConfig } from "@feemarket/app-types";
import { ChainID } from "@feemarket/app-types";
import chainLogo from "../images/network/ethereum.svg";
import contractInterface from "../abi/eth.json";

const config: EthChainConfig = {
  chainId: ChainID.ETHEREUM,
  chainName: "Ethereum",
  displayName: "Ethereum",
  chainLogo,
  graphql: {
    endpoint: "",
  },
  nativeToken: {
    symbol: "ETH",
    decimals: 18,
  },
  explorer: {
    url: "https://etherscan.io/",
  },
  contractAddress: "0xCD97185B7d05f8ea91d241C8dfD51a2Cc9c0547a",
  contractInterface,
};

export default config;
