import ConnectWallet from "../components/ConnectWallet";
import Dashboard from "../components/RelayerDashboard";

import { useApi, useFeeMarket } from "@feemarket/app-provider";

const RelayerDashboard = () => {
  const { currentMarket } = useFeeMarket();
  const { api, requestAccounts } = useApi();

  // const { currentAccount } = useApi();
  const currentAccount = "5H9Aq1mZQh5yZBuNWqbSaZAmdiQFBWSdtzosSL3H6FNknLbW";

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
