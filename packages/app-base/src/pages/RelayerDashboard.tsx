import ConnectWallet from "../components/ConnectWallet";
import Dashboard from "../components/RelayerDashboard";

import { useApi, useFeeMarket } from "@feemarket/app-provider";

const RelayerDashboard = () => {
  const { currentMarket } = useFeeMarket();
  const { api, accounts, requestAccounts } = useApi();

  return (
    <>
      {accounts !== null ? (
        <Dashboard />
      ) : (
        <ConnectWallet loading={api === null} sourceChain={currentMarket?.source} onConnected={requestAccounts} />
      )}
    </>
  );
};

export default RelayerDashboard;
