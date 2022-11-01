import ConnectWallet from "../components/ConnectWallet";
import Dashboard from "../components/RelayerDashboard";

import { useMarket } from "@feemarket/market";
import { useApi } from "@feemarket/api";

const RelayerDashboard = () => {
  const { currentMarket } = useMarket();
  const { signerApi: api, currentAccount, requestAccounts } = useApi();

  return (
    <>
      {currentAccount ? (
        <Dashboard relayerAddress={currentAccount.address} />
      ) : (
        <ConnectWallet loading={api === null} sourceChain={currentMarket?.source} onConnected={requestAccounts} />
      )}
    </>
  );
};

export default RelayerDashboard;
