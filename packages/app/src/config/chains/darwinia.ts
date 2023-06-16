import type { EthChainConfig } from "../../types/chain";
import chainLogo from "../../assets/images/network/darwinia.svg";
import contractInterface from "../abi/smartChain.json";

const config: EthChainConfig = {
  chainId: 46,
  chainName: "Darwinia",
  displayName: "Darwinia",
  chainLogo,
  graphql: {
    endpoint: "https://thegraph.darwinia.network/feemarket/subgraphs/name/feemarket-darwinia-v1",
  },
  nativeToken: {
    symbol: "RING",
    decimals: 18,
  },
  explorer: {
    url: "https://darwinia.subscan.io/",
    name: "Subscan",
  },
  provider: {
    rpc: "https://rpc.darwinia.network/",
  },
  contractAddress: "0x9bd2F907B33E25126CD4e4342a75dE8F8eff76Bf",
  contractInterface,
  isSmartChain: true,
  wallets: ["metamask", "wallet-connect"],
};

export default config;
