import ConnectWallet from "../components/ConnectWallet";
import Dashboard from "../components/RelayerDashboard";

import { useApi } from "@feemarket/app-provider";

const RelayerDashboard = () => {
  const { accounts, requestAccounts } = useApi();

  return <>{accounts !== null ? <Dashboard /> : <ConnectWallet onConnected={requestAccounts} />}</>;
};

export default RelayerDashboard;
