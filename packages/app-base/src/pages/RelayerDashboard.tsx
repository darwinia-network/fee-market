import ConnectWallet from "../components/ConnectWallet";
import { useState } from "react";
import Dashboard from "../components/RelayerDashboard";

const RelayerDashboard = () => {
  const [isWalletConnected, setWalletConnected] = useState(false);

  const onWalletConnected = () => {
    setWalletConnected(true);
  };

  return <>{isWalletConnected ? <Dashboard /> : <ConnectWallet onConnected={onWalletConnected} />}</>;
};

export default RelayerDashboard;
