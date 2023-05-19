import type { EthChainConfig } from "../../types/chain";
import chainLogo from "../../assets/images/network/pangoro.svg";
import contractInterface from "../abi/smartChain.json";

const config: EthChainConfig = {
  chainId: 45,
  chainName: "Pangoro Smart Chain",
  displayName: "Pangoro Smart Chain",
  chainLogo,
  graphql: {
    endpoint: "https://thegraph.darwinia.network/feemarket/subgraphs/name/feemarket-pangoro-v1",
  },
  nativeToken: {
    symbol: "ORING",
    decimals: 18,
  },
  explorer: {
    url: "https://pangoro.subscan.io/",
  },
  provider: {
    rpc: "https://pangoro-rpc.darwinia.network/",
  },
  contractAddress: "0x25ee4212CfA2DC29E6a5e4A857b9656E439259c9",
  contractInterface,
  isSmartChain: true,
};

export default config;
