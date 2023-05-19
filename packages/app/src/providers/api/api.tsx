import { providers } from "ethers";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useState } from "react";
import { useMarket } from "../../hooks/market";
import type { Account } from "../../types";
import { isEthChain, isPolkadotChain, getEthChainConfig, getPolkadotChainConfig } from "../../utils";
import { GraphqlProvider } from "./graphql";
import { useNetwork } from "wagmi";

const ACTIVE_ACCOUNT_KEY = "feemarket_active_account";

export interface ApiCtx {
  isWalletInstalled: boolean;
  signerApi: providers.Provider | ApiPromise | null;
  providerApi: providers.Provider | ApiPromise | null;
  accounts: Account[];
  currentAccount: Account | null;
  currentChainId: number | null;
  setAccounts: (accounts: Account[]) => void;
  setCurrentAccount: (account: Account) => void;
}

const defaultValue: ApiCtx = {
  isWalletInstalled: false,
  signerApi: null,
  providerApi: null,
  accounts: [],
  currentAccount: null,
  currentChainId: null,
  setAccounts: () => undefined,
  setCurrentAccount: () => undefined,
};

export const ApiContext = createContext<ApiCtx>(defaultValue);

export const ApiProvider = ({ children }: PropsWithChildren<unknown>) => {
  const { currentMarket } = useMarket();
  const { chain } = useNetwork();
  const [isWalletInstalled, setIsWalletInstalled] = useState(false);
  const [signerApi, setSignerApi] = useState<providers.Provider | ApiPromise | null>(null);
  const [providerApi, setProviderApi] = useState<providers.Provider | ApiPromise | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currentAccount, _setCurrentAccount] = useState<Account | null>(null);
  const [currentChainId, setCurrentChainId] = useState<number | null>(null);

  const sourceChain = currentMarket?.source;

  const setCurrentAccount = useCallback((acc: Account | null) => {
    if (acc?.originAddress) {
      localStorage.setItem(ACTIVE_ACCOUNT_KEY, acc.originAddress);
    }
    _setCurrentAccount(acc);
  }, []);

  useEffect(() => {
    let api: ApiPromise | null = null;

    if (isEthChain(sourceChain)) {
      const rpc = getEthChainConfig(sourceChain).provider.rpc;
      if (rpc.startsWith("ws")) {
        setProviderApi(new providers.WebSocketProvider(rpc));
      } else if (rpc.startsWith("http")) {
        setProviderApi(new providers.JsonRpcProvider(rpc));
      }
      setIsWalletInstalled(true);
    } else if (isPolkadotChain(sourceChain)) {
      const injecteds = window.injectedWeb3;
      const haveWallet =
        injecteds &&
        (injecteds["polkadot-js"] ||
          injecteds['"polkadot-js"'] ||
          injecteds["talisman"] ||
          injecteds['"talisman"'] ||
          injecteds["subwallet-js"] ||
          injecteds['"subwallet-js"'])
          ? true
          : false;
      setIsWalletInstalled(haveWallet);

      const rpc = getPolkadotChainConfig(sourceChain).provider.rpc;
      const provider = new WsProvider(rpc);
      api = new ApiPromise({ provider });
      api.on("error", () => {
        setSignerApi(null);
        setProviderApi(null);
      });
      api.on("ready", () => {
        if (haveWallet) {
          setSignerApi((prev) => prev ?? api);
        }
        setProviderApi((prev) => prev ?? api);
      });
      api.on("disconnected", () => {
        setSignerApi(null);
        setProviderApi(null);
      });
    }

    return () => {
      if (api) {
        api.off("error", () => undefined);
        api.off("ready", () => undefined);
        api.off("connected", () => undefined);
        api.off("disconnected", () => undefined);
      }

      setIsWalletInstalled(false);
      setAccounts([]);
      setSignerApi(null);
      setProviderApi(null);
    };
  }, [sourceChain]);

  useEffect(() => {
    if (accounts.length) {
      const storageAddress = localStorage.getItem(ACTIVE_ACCOUNT_KEY);
      setCurrentAccount(accounts.find((item) => item.originAddress === storageAddress) ?? accounts[0]);
    }

    return () => {
      setCurrentAccount(null);
    };
  }, [accounts, setCurrentAccount]);

  useEffect(() => {
    if (isEthChain(sourceChain)) {
      setCurrentChainId(chain?.id || null);
    } else if (isPolkadotChain(sourceChain)) {
      setCurrentChainId(null);
    }
    return () => {
      setCurrentChainId(null);
    };
  }, [sourceChain, chain]);

  return (
    <GraphqlProvider>
      <ApiContext.Provider
        value={{
          isWalletInstalled,
          signerApi,
          providerApi,
          accounts,
          currentAccount,
          currentChainId,
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
