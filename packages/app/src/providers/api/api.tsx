import { ApiPromise, WsProvider } from "@polkadot/api";
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useState } from "react";
import { useMarket } from "../../hooks/market";
import type { Account } from "../../types";
import { isEthChain, isPolkadotChain, getPolkadotChainConfig, getEthChainConfig } from "../../utils";
import { GraphqlProvider } from "./graphql";
import { getPublicClient, getWalletClient, watchPublicClient, watchWalletClient } from "@wagmi/core";
import type { PublicClient, WalletClient } from "wagmi";
import { Subscription, from } from "rxjs";

const ACTIVE_ACCOUNT_STORAGE_KEY = "active:account";

export interface ApiCtx {
  hasWallet: boolean;
  signerApi: WalletClient | ApiPromise | null;
  providerApi: PublicClient | ApiPromise | null;
  accounts: Account[];
  currentAccount: Account | null;
  setAccounts: (accounts: Account[]) => void;
  setCurrentAccount: (account: Account) => void;
}

const defaultValue: ApiCtx = {
  hasWallet: false,
  signerApi: null,
  providerApi: null,
  accounts: [],
  currentAccount: null,
  setAccounts: () => undefined,
  setCurrentAccount: () => undefined,
};

export const ApiContext = createContext<ApiCtx>(defaultValue);

export const ApiProvider = ({ children }: PropsWithChildren<unknown>) => {
  const { sourceChain } = useMarket();

  const [hasWallet, setHasWallet] = useState(false);
  const [signerApi, setSignerApi] = useState<WalletClient | ApiPromise | null>(null);
  const [providerApi, setProviderApi] = useState<PublicClient | ApiPromise | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currentAccount, _setCurrentAccount] = useState<Account | null>(null);

  const setCurrentAccount = useCallback((acc: Account | null) => {
    if (acc?.originAddress) {
      localStorage.setItem(ACTIVE_ACCOUNT_STORAGE_KEY, acc.originAddress);
    }
    _setCurrentAccount(acc);
  }, []);

  // Update api
  useEffect(() => {
    let api: ApiPromise | null = null;
    let walletInstalled = false;
    let sub$$: Subscription | null = null;
    let unwatchPublic: (() => void) | null = null;
    let unwatchWallet: (() => void) | null = null;

    const errorHandler = () => {
      setSignerApi(null);
      setProviderApi(null);
    };
    const readyHandler = () => {
      if (walletInstalled) {
        setSignerApi((prev) => prev ?? api);
      }
      setProviderApi((prev) => prev ?? api);
    };
    const disconnectedHandler = () => {
      setSignerApi(null);
      setProviderApi(null);
    };

    if (isEthChain(sourceChain)) {
      const chainConfig = getEthChainConfig(sourceChain);

      // No matter how the network is switched, publicClient will allways keep this chain
      setProviderApi(getPublicClient({ chainId: chainConfig.chainId }));
      sub$$ = from(getWalletClient()).subscribe({
        next: setSignerApi,
        error: console.error,
      });

      // No matter how the network is switched, publicClient will allways keep this chain
      unwatchPublic = watchPublicClient({ chainId: chainConfig.chainId }, setProviderApi);
      unwatchWallet = watchWalletClient({}, setSignerApi);

      // Since WalletConnect is used, the wallet is considered to exist all the time
      walletInstalled = true;
      setHasWallet(walletInstalled);
    } else if (isPolkadotChain(sourceChain)) {
      const injecteds = window.injectedWeb3;
      walletInstalled =
        injecteds &&
        (injecteds["polkadot-js"] ||
          injecteds['"polkadot-js"'] ||
          injecteds["talisman"] ||
          injecteds['"talisman"'] ||
          injecteds["subwallet-js"] ||
          injecteds['"subwallet-js"'])
          ? true
          : false;
      setHasWallet(walletInstalled);

      const rpc = getPolkadotChainConfig(sourceChain).provider.rpc;
      const provider = new WsProvider(rpc);
      api = new ApiPromise({ provider });
      api.on("error", errorHandler);
      api.on("ready", readyHandler);
      api.on("disconnected", disconnectedHandler);
    }

    return () => {
      if (api) {
        api.off("error", errorHandler);
        api.off("ready", readyHandler);
        api.off("disconnected", disconnectedHandler);
      }
      if (sub$$) {
        sub$$.unsubscribe();
        sub$$ = null;
      }
      if (unwatchPublic) {
        unwatchPublic();
        unwatchPublic = null;
      }
      if (unwatchWallet) {
        unwatchWallet();
        unwatchWallet = null;
      }

      api = null;
      walletInstalled = false;

      setHasWallet(false);
      setSignerApi(null);
      setProviderApi(null);
      setAccounts([]);
    };
  }, [sourceChain]);

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
          hasWallet,
          signerApi,
          providerApi,
          accounts,
          currentAccount,
          setAccounts,
          setCurrentAccount,
        }}
      >
        {children}
      </ApiContext.Provider>
    </GraphqlProvider>
  );
};

export const useApi = () => useContext(ApiContext);
