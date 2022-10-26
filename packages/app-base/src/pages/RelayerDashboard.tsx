import ConnectWallet from "../components/ConnectWallet";
import Dashboard from "../components/RelayerDashboard";

import { useApi, useFeeMarket } from "@feemarket/app-provider";

const RelayerDashboard = () => {
  const { currentMarket } = useFeeMarket();
  const { api, requestAccounts } = useApi();

  // const { currentAccount } = useApi();
  const currentAccount = "0x68898db1012808808c903f390909c52d9f706749";

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
