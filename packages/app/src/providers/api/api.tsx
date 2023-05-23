import { ApiPromise, WsProvider } from "@polkadot/api";
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useState } from "react";
import { useMarket } from "../../hooks/market";
import type { Account, WalletID } from "../../types";
import { isEthChain, isPolkadotChain, getPolkadotChainConfig, getEthChainConfig } from "../../utils";
import { GraphqlProvider } from "./graphql";
import { getWalletClient, watchWalletClient, watchAccount } from "@wagmi/core";
import { WalletClient } from "wagmi";
import { Subscription, from } from "rxjs";
import { ethers } from "ethers";

const ACTIVE_ACCOUNT_STORAGE_KEY = "active:account";

interface ApiCtx {
  signerApi: WalletClient | ApiPromise | ethers.providers.Provider | null;
  providerApi: ApiPromise | ethers.providers.Provider | null;
  accounts: Account[];
  currentAccount: Account | null;
  setAccounts: (accounts: Account[]) => void;
  setCurrentAccount: (account: Account) => void;
  setActiveWallet: (wallet: WalletID | null) => void;
}

const defaultValue: ApiCtx = {
  signerApi: null,
  providerApi: null,
  accounts: [],
  currentAccount: null,
  setAccounts: () => undefined,
  setCurrentAccount: () => undefined,
  setActiveWallet: () => undefined,
};

export const ApiContext = createContext<ApiCtx>(defaultValue);

export const ApiProvider = ({ children }: PropsWithChildren<unknown>) => {
  const { sourceChain } = useMarket();

  const [signerApi, setSignerApi] = useState<WalletClient | ApiPromise | ethers.providers.Provider | null>(null);
  const [providerApi, setProviderApi] = useState<ApiPromise | ethers.providers.Provider | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currentAccount, _setCurrentAccount] = useState<Account | null>(null);
  const [activeWallet, setActiveWallet] = useState<WalletID | null>(null);

  const setCurrentAccount = useCallback((acc: Account | null) => {
    if (acc?.originAddress) {
      localStorage.setItem(ACTIVE_ACCOUNT_STORAGE_KEY, acc.originAddress);
    }
    _setCurrentAccount(acc);
  }, []);

  // update signerApi & acccouts
  useEffect(() => {
    let api: ApiPromise | null = null;
    let sub$$: Subscription | null = null;
    let unwatchWallet: () => void = () => undefined;
    let unwatchAccount: () => void = () => undefined;

    const errorHandler = () => {
      setSignerApi(null);
    };
    const readyHandler = () => {
      setSignerApi((prev) => prev ?? api);
    };
    const disconnectedHandler = () => {
      setSignerApi(null);
    };

    if (isEthChain(sourceChain)) {
      if (activeWallet === "metamask") {
        setSignerApi(new ethers.providers.Web3Provider(window.ethereum));

        window.ethereum.on("chainChanged", () => {
          setSignerApi(new ethers.providers.Web3Provider(window.ethereum));
        });

        window.ethereum.on("accountsChanged", (accs: string[]) => {
          setAccounts(accs.map((address) => ({ address, originAddress: address } as Account)));
        });
      } else if (activeWallet === "wallet-connect") {
        sub$$ = from(getWalletClient()).subscribe({
          next: setSignerApi,
          error: console.error,
        });
        unwatchWallet = watchWalletClient({}, setSignerApi);

        unwatchAccount = watchAccount(({ address }) =>
          setAccounts(address ? [{ address, originAddress: address, meta: {} }] : [])
        );
      } else {
        setSignerApi(null);
        setAccounts([]);
      }
    } else if (isPolkadotChain(sourceChain)) {
      if (activeWallet === "polkadot-js") {
        const rpc = getPolkadotChainConfig(sourceChain).provider.rpc;
        const provider = new WsProvider(rpc);
        api = new ApiPromise({ provider });
        api.on("error", errorHandler);
        api.on("ready", readyHandler);
        api.on("disconnected", disconnectedHandler);
      } else {
        setSignerApi(null);
        setAccounts([]);
      }
    } else {
      setSignerApi(null);
      setAccounts([]);
    }

    return () => {
      api?.off("error", errorHandler);
      api?.off("ready", readyHandler);
      api?.off("disconnected", disconnectedHandler);
      sub$$?.unsubscribe();
      unwatchWallet();
      unwatchAccount();
    };
  }, [sourceChain, activeWallet]);

  // update providerApi
  useEffect(() => {
    let api: ApiPromise | null = null;
    const errorHandler = () => {
      setProviderApi(null);
    };
    const readyHandler = () => {
      setProviderApi((prev) => prev ?? api);
    };
    const disconnectedHandler = () => {
      setProviderApi(null);
    };

    if (isEthChain(sourceChain)) {
      const rpc = getEthChainConfig(sourceChain).provider.rpc;
      if (rpc.startsWith("ws")) {
        setProviderApi(new ethers.providers.WebSocketProvider(rpc));
      } else if (rpc.startsWith("http")) {
        setProviderApi(new ethers.providers.JsonRpcProvider(rpc));
      }
    } else if (isPolkadotChain(sourceChain)) {
      const rpc = getPolkadotChainConfig(sourceChain).provider.rpc;
      const provider = new WsProvider(rpc);
      api = new ApiPromise({ provider });
      api.on("error", errorHandler);
      api.on("ready", readyHandler);
      api.on("disconnected", disconnectedHandler);
    }

    return () => {
      api?.off("error", errorHandler);
      api?.off("ready", readyHandler);
      api?.off("disconnected", disconnectedHandler);

      setProviderApi(null);
    };
  }, [sourceChain]);

  // currentAccount
  useEffect(() => {
    if (accounts.length) {
      const storageAddress = localStorage.getItem(ACTIVE_ACCOUNT_STORAGE_KEY);
      setCurrentAccount(accounts.find((item) => item.originAddress === storageAddress) ?? accounts[0]);
    }
    return () => {
      setCurrentAccount(null);
    };
  }, [accounts, setCurrentAccount]);

  return (
    <GraphqlProvider>
      <ApiContext.Provider
        value={{
          signerApi,
          providerApi,
          accounts,
          currentAccount,
          setAccounts,
          setCurrentAccount,
          setActiveWallet,
        }}
      >
        {children}
      </ApiContext.Provider>
    </GraphqlProvider>
  );
};

export const useApi = () => useContext(ApiContext);
