import type { EthChainConfig } from "../../types/chain";
import chainLogo from "../../assets/images/network/ethereum.svg";
import contractInterface from "../abi/eth.json";

const config: EthChainConfig = {
  chainId: 1,
  chainName: "Ethereum",
  displayName: "Ethereum",
  chainLogo,
  graphql: {
    endpoint: "https://thegraph.darwinia.network/feemarket/subgraphs/name/feemarket-ethereum",
  },
  nativeToken: {
    symbol: "ETH",
    decimals: 18,
  },
  explorer: {
    url: "https://etherscan.io/",
    name: "Etherscan",
  },
  provider: {
    rpc: "https://eth-mainnet.g.alchemy.com/v2/1fYUXWGBTu0naj6Stf7Sh77VAO-J5j4v",
  },
  contractAddress: "0xC71593F6Cb1642DD95bd1330f7c0a59d9f66Db97",
  contractInterface,
  wallets: ["metamask", "wallet-connect"],
};

export default config;
