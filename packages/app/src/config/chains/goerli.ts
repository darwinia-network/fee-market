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
    rpc: "https://eth-goerli.g.alchemy.com/v2/oanvaPnbDzYvigj3O_67w3SBcvbDvim8",
  },
  contractAddress: "0xdb5E16A6E25ABF29dbe26e701D1DDCad03180E92",
  contractInterface,
  wallets: ["metamask", "wallet-connect"],
};

export default config;
