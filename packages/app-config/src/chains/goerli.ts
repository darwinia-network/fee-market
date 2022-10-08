import type { EthChainConfig } from "@feemarket/app-types";
import { ChainID } from "@feemarket/app-types";
import chainLogo from "../images/network/ethereum.svg";
import contractInterface from "../abi/eth.json";

const config: EthChainConfig = {
  chainId: ChainID.GOERLI,
  chainName: "Goerli",
  displayName: "Goerli Testnet",
  chainLogo,
  graphql: {
    endpoint: "",
  },
  nativeToken: {
    symbol: "GoerliETH",
    decimals: 18,
  },
  explorer: {
    url: "https://goerli.etherscan.io/",
  },
  contractAddress: "0xdb5E16A6E25ABF29dbe26e701D1DDCad03180E92",
  contractInterface,
};

export default config;
