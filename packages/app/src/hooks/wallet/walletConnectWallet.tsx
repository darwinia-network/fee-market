import logo from "../../assets/images/wallet-connect-logo.svg";
import { useCallback, useEffect } from "react";
import { useWeb3Modal } from "@web3modal/react";
import { useAccount } from "wagmi";
import { useApi } from "../api";
import { useMarket } from "../market";
import { isEthChain } from "../../utils";

export const useWalletConnectWallet = () => {
  const { currentMarket } = useMarket();
  const { setAccounts } = useApi();
  const { open } = useWeb3Modal();
  const { address } = useAccount();

  const connect = useCallback(async () => {
    await open();
  }, [open]);

  const disconnect = useCallback(() => {
    // TODO
  }, []);

  useEffect(() => {
    if (address && isEthChain(currentMarket?.source)) {
      setAccounts([{ address, originAddress: address, meta: {} }]);
    }
  }, [address, currentMarket?.source, setAccounts]);

  return { logo, connect, disconnect };
};
