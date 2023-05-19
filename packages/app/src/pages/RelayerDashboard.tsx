import ConnectWallet from "../components/ConnectWallet";
import Dashboard from "../components/RelayerDashboard";
import { RelayerProvider } from "../providers";
import { useMarket, useApi } from "../hooks";
import { isPolkadotChain } from "../utils";

const RelayerDashboard = () => {
  const { currentMarket } = useMarket();
  const { signerApi: api, currentAccount, isWalletInstalled } = useApi();

  const sourceChain = currentMarket?.source;

  return (
    <>
      {currentAccount ? (
        <RelayerProvider relayerAddress={currentAccount.address}>
          <Dashboard />
        </RelayerProvider>
      ) : (
        <ConnectWallet
          loading={isWalletInstalled && isPolkadotChain(sourceChain) && api === null}
          isInstalled={isWalletInstalled}
        />
      )}
    </>
  );
};

export default RelayerDashboard;
