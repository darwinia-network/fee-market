import ConnectWallet from "../components/ConnectWallet";
import Dashboard from "../components/RelayerDashboard";
import { RelayerProvider } from "../providers";
import { useMarket, useApi } from "../hooks";
import { isPolkadotChain } from "../utils";

const RelayerDashboard = () => {
  const { sourceChain } = useMarket();
  const { signerApi: api, currentAccount, hasWallet } = useApi();

  return (
    <>
      {currentAccount ? (
        <RelayerProvider relayerAddress={currentAccount.address} advanced>
          <Dashboard />
        </RelayerProvider>
      ) : (
        <ConnectWallet loading={hasWallet && isPolkadotChain(sourceChain) && api === null} isInstalled={hasWallet} />
      )}
    </>
  );
};

export default RelayerDashboard;
