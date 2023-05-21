import logo from "../../assets/images/wallet-connect-logo.svg";
import { useCallback, useEffect } from "react";
import { useWeb3Modal } from "@web3modal/react";
import { useAccount, useConnect } from "wagmi";
import { useApi } from "../api";
import { useMarket } from "../market";
import { getEthChainConfig, isEthApi, isEthChain } from "../../utils";

export const useWalletConnectWallet = () => {
  const { sourceChain } = useMarket();
  const { signerApi, setAccounts } = useApi();
  const { open, setDefaultChain } = useWeb3Modal();
  const { address } = useAccount();
  const { connectors } = useConnect();

  const connect = useCallback(async () => {
    await open();
  }, [open]);

  const disconnect = useCallback(() => {
    // TODO
  }, []);

  useEffect(() => {
    if (isEthApi(signerApi)) {
      setAccounts(address ? [{ address, originAddress: address, meta: {} }] : []);
    }
  }, [address, signerApi, setAccounts]);

  useEffect(() => {
    if (isEthChain(sourceChain) && connectors.length) {
      const { chainId } = getEthChainConfig(sourceChain);
      setDefaultChain(connectors[0].chains.find(({ id }) => id === chainId));
    }
  }, [connectors, sourceChain, setDefaultChain]);

  return { logo, connect, disconnect };
};
