import ConnectWallet from "../components/ConnectWallet";
import Dashboard from "../components/RelayerDashboard";

import { useApi, useFeeMarket } from "@feemarket/app-provider";

const RelayerDashboard = () => {
  const { currentMarket } = useFeeMarket();
  const { api, requestAccounts } = useApi();

  const { currentAccount } = useApi();
  // const currentAccount = "2obUAkPJ3GkHHyAQei1PgbQ8vQ3GYoJxRwLArpTyd5BR5ewK";

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
