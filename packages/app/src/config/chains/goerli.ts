import type { EthChainConfig } from "../../types/chain";
import chainLogo from "../../assets/images/network/ethereum.svg";
import contractInterface from "../abi/eth.json";

const config: EthChainConfig = {
  chainId: 5,
  chainName: "Goerli",
  displayName: "Goerli Testnet",
  chainLogo,
  graphql: {
    endpoint: "https://thegraph.darwinia.network/feemarket/subgraphs/name/feemarket-goerli",
  },
  nativeToken: {
    symbol: "ETH",
    decimals: 18,
  },
  explorer: {
    url: "https://goerli.etherscan.io/",
    name: "Etherscan",
  },
  provider: {
    rpc: "https://ethereum-goerli.publicnode.com",
  },
  contractAddress: "0x6c73B30a48Bb633DC353ed406384F73dcACcA5C3",
  contractInterface,
  wallets: ["metamask", "wallet-connect"],
};

export default config;
