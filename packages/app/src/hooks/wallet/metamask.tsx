import { useCallback, useEffect, useMemo, useState } from "react";
import logo from "../../assets/images/wallet/metamask.svg";
import { Account, Wallet } from "../../types";
import { ethers } from "ethers";
import { useApi } from "../api";

export const useMetaMask = (): Wallet => {
  const { setActiveWallet, setAccounts } = useApi();
  const [loading, setLoading] = useState(false);

  const installed = useMemo(() => {
    return typeof window.ethereum !== "undefined";
  }, []);

  const connect = useCallback(async () => {
    setLoading(true);

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accs = ((await provider.send("eth_requestAccounts", [])) as string[]).map(
        (address) => ({ address, originAddress: address } as Account)
      );
      setAccounts(accs);

      setActiveWallet("metamask");
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  }, [setActiveWallet, setAccounts]);

  const disconnect = useCallback(() => {
    setActiveWallet(null);
  }, [setActiveWallet]);

  useEffect(() => {
    disconnect();
  }, [disconnect]);

  return { id: "metamask", installed, logo, loading, name: "MetaMask", connect, disconnect };
};
