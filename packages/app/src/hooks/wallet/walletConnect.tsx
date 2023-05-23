import logo from "../../assets/images/wallet/wallet-connect.svg";
import { useCallback, useEffect, useState } from "react";
import { useWeb3Modal } from "@web3modal/react";
import { useConnect, useDisconnect } from "wagmi";
import { useMarket } from "../market";
import { getEthChainConfig, isEthChain } from "../../utils";
import { Wallet } from "../../types";
import { useApi } from "../api";

export const useWalletConnect = (): Wallet => {
  const { sourceChain } = useMarket();
  const { setActiveWallet } = useApi();
  const { open, setDefaultChain } = useWeb3Modal();
  const { connectors } = useConnect();
  const { disconnect: disconnectWallet } = useDisconnect();
  const [loading, setLoading] = useState(false);

  const connect = useCallback(async () => {
    setLoading(true);
    await open();
    setLoading(false);
    setActiveWallet("wallet-connect");
  }, [open, setActiveWallet]);

  const disconnect = useCallback(() => {
    disconnectWallet();
    setActiveWallet(null);
  }, [setActiveWallet, disconnectWallet]);

  useEffect(() => {
    if (isEthChain(sourceChain) && connectors.length) {
      const { chainId } = getEthChainConfig(sourceChain);
      setDefaultChain(connectors[0].chains.find(({ id }) => id === chainId));
    }
  }, [connectors, sourceChain, setDefaultChain]);

  useEffect(() => {
    disconnect();
  }, [disconnect]);

  return { id: "wallet-connect", installed: true, logo, loading, name: "WalletConnect", connect, disconnect };
};
