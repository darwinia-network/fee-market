import { ApiProvider, MarketProvider } from "./providers";
import App from "./App";

import { EthereumClient, w3mConnectors, w3mProvider } from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/react";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { mainnet, goerli } from "wagmi/chains";

const chains = [mainnet, goerli];
const projectId = "12c48c2a9521b1447d902c9e06ddfe79";

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, version: 1, chains }),
  publicClient,
});
const ethereumClient = new EthereumClient(wagmiConfig, chains);

const Root = () => {
  return (
    <>
      <MarketProvider>
        <WagmiConfig config={wagmiConfig}>
          <ApiProvider>
            <App />
          </ApiProvider>
        </WagmiConfig>
      </MarketProvider>
      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </>
  );
};

export default Root;
