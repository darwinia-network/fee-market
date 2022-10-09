import ConnectWallet from "../components/ConnectWallet";
import Dashboard from "../components/RelayerDashboard";

import { useApi } from "@feemarket/app-provider";

const RelayerDashboard = () => {
  const { api, accounts, requestAccounts } = useApi();

  return (
    <>{accounts !== null ? <Dashboard /> : <ConnectWallet loading={api === null} onConnected={requestAccounts} />}</>
  );
};

export default RelayerDashboard;
