import { useMemo } from "react";
import { usePolkadotJsWallet } from "./polkadotJsWallet";
import { useWalletConnectWallet } from "./walletConnectWallet";
import { useMarket } from "../market";
import { isEthChain, isPolkadotChain } from "../../utils";

export const useWallet = () => {
  const { currentMarket } = useMarket();

  const polkadotJs = usePolkadotJsWallet();
  const walletConnect = useWalletConnectWallet();

  return useMemo(() => {
    const fallback = {
      logo: "",
      connect: async () => {
        /** */
      },
      disconnect: () => {
        /** */
      },
    };

    if (currentMarket) {
      if (isPolkadotChain(currentMarket.source)) {
        return polkadotJs;
      } else if (isEthChain(currentMarket.source)) {
        return walletConnect;
      }
    }
    return fallback;
  }, [polkadotJs, walletConnect, currentMarket]);
};
