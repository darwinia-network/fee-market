import type { EthChainConfig } from "../../types/chain";
import chainLogo from "../../assets/images/network/pangolin.svg";
import contractInterface from "../abi/smartChain.json";

const config: EthChainConfig = {
  chainId: 43,
  chainName: "Pangolin",
  displayName: "Pangolin",
  chainLogo,
  graphql: {
    endpoint: "https://thegraph.darwinia.network/feemarket/subgraphs/name/feemarket-pangolin",
  },
  nativeToken: {
    symbol: "PRING",
    decimals: 18,
  },
  explorer: {
    url: "https://pangolin.subscan.io/",
    name: "Subscan",
  },
  provider: {
    rpc: "https://pangolin-rpc.darwinia.network",
  },
  contractAddress: "0x4DBdC9767F03dd078B5a1FC05053Dd0C071Cc005",
  contractInterface,
  isSmartChain: true,
  wallets: ["metamask", "wallet-connect"],
};

export default config;
