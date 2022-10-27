import ConnectWallet from "../components/ConnectWallet";
import Dashboard from "../components/RelayerDashboard";

import { useApi, useFeeMarket } from "@feemarket/app-provider";

const RelayerDashboard = () => {
  const { currentMarket } = useFeeMarket();
  const { signerApi: api, requestAccounts } = useApi();

  const { currentAccount } = useApi();

  return (
    <>
      {currentAccount ? (
        <Dashboard relayerAddress={currentAccount} />
      ) : (
        <ConnectWallet loading={api === null} sourceChain={currentMarket?.source} onConnected={requestAccounts} />
      )}
    </>
  );
};

export default RelayerDashboard;
