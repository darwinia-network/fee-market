import type { EthChainConfig } from "@feemarket/app-types";
import { ChainID } from "@feemarket/app-types";
import chainLogo from "../images/network/ethereum.svg";

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
};

export default config;
