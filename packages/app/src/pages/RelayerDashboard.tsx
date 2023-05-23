import ConnectWallet from "../components/ConnectWallet";
import Dashboard from "../components/RelayerDashboard";
import { RelayerProvider } from "../providers";
import { useApi } from "../hooks";

const RelayerDashboard = () => {
  const { currentAccount } = useApi();

  return (
    <>
      {currentAccount ? (
        <RelayerProvider relayerAddress={currentAccount.address} advanced>
          <Dashboard />
        </RelayerProvider>
      ) : (
        <ConnectWallet />
      )}
    </>
  );
};

export default RelayerDashboard;
