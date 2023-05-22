import { useMemo } from "react";
import { usePolkadotJs } from "./polkadotJs";
import { useWalletConnect } from "./walletConnect";
import { useMarket } from "../market";
import { isEthChain, isPolkadotChain } from "../../utils";

export const useWallet = () => {
  const { currentMarket } = useMarket();

  const polkadotJs = usePolkadotJs();
  const walletConnect = useWalletConnect();

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
