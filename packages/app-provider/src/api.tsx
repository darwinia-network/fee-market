import { ApiPromise, WsProvider } from "@polkadot/api";
import { providers } from "ethers";
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useState } from "react";
import { useFeeMarket } from "./feemarket";
import { ETH_CHAIN_CONF, POLKADOT_CHAIN_CONF, DAPP_NAME } from "@feemarket/app-config";
import { isEthApi, isEthChain, isPolkadotApi, isPolkadotChain } from "@feemarket/app-utils";
import { from, Subscription } from "rxjs";
import { web3Accounts, web3Enable } from "@polkadot/extension-dapp";
import type { u16 } from "@polkadot/types";
import { encodeAddress } from "@polkadot/util-crypto";
import keyring from "@polkadot/ui-keyring";

export interface ApiCtx {
  api: providers.Provider | ApiPromise | null;
  signerApi: providers.Provider | ApiPromise | null;
  providerApi: providers.Provider | ApiPromise | null;
  accounts: string[] | null;
  currentAccount: string | null;
  currentChainId: number | null;
  requestAccounts: () => Promise<void>;
  setCurrentAccount: (account: string) => void;
}

const defaultValue: ApiCtx = {
  api: null,
  signerApi: null,
  providerApi: null,
  accounts: null,
  currentAccount: null,
  currentChainId: null,
  requestAccounts: async () => undefined,
  setCurrentAccount: () => undefined,
};

export const ApiContext = createContext<ApiCtx>(defaultValue);

export const ApiProvider = ({ children }: PropsWithChildren<unknown>) => {
  const { currentMarket } = useFeeMarket();
  const [api, setApi] = useState<providers.Provider | ApiPromise | null>(null);
  const [signerApi, setSignerApi] = useState<providers.Provider | ApiPromise | null>(null);
  const [providerApi, setProviderApi] = useState<providers.Provider | ApiPromise | null>(null);
  const [accounts, setAccounts] = useState<string[] | null>(null);
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [currentChainId, setCurrentChainId] = useState<number | null>(null);

  const sourceChain = currentMarket?.source;

  const requestAccounts = useCallback(async () => {
    if (isEthApi(signerApi)) {
      const allAccounts = await signerApi.send("eth_requestAccounts", []);
      setAccounts(allAccounts);
      setCurrentAccount(allAccounts.length ? allAccounts[0] : null);
    } else if (isPolkadotApi(signerApi)) {
      await web3Enable(DAPP_NAME);

      const ss58Prefix = (signerApi.consts.system.ss58Prefix as u16).toNumber();
      const allAccounts = (await web3Accounts()).map((item) => ({
        ...item,
        address: encodeAddress(item.address, ss58Prefix),
      }));

      allAccounts.forEach((item) => {
        keyring.saveAddress(item.address, item.meta);
      });

      setAccounts(allAccounts.map((item) => item.address));
      setCurrentAccount(allAccounts.length ? allAccounts[0].address : null);
    } else {
      setAccounts(null);
      setCurrentAccount(null);
    }
  }, [signerApi]);

  useEffect(() => {
    if (isEthChain(sourceChain)) {
      const rpc = ETH_CHAIN_CONF[sourceChain].provider.rpc;
      if (rpc.startsWith("ws")) {
        setProviderApi(new providers.WebSocketProvider(rpc));
      } else if (rpc.startsWith("http")) {
        setProviderApi(new providers.JsonRpcProvider(rpc));
      }

      if (typeof window.ethereum !== "undefined") {
        const provider = new providers.Web3Provider(window.ethereum);
        setApi(provider);
        setSignerApi(provider);

        window.ethereum.on("chainChanged", () => {
          const provider = new providers.Web3Provider(window.ethereum);
          setApi(provider);
          setSignerApi(provider);
        });

        window.ethereum.on("accountsChanged", (accs: string[]) => {
          setAccounts(accs);
          setCurrentAccount(null);
        });
      }
    } else if (isPolkadotChain(sourceChain)) {
      const rpc = POLKADOT_CHAIN_CONF[sourceChain].provider.rpc;
      const provider = new WsProvider(rpc);
      const api = new ApiPromise({ provider });
      api.on("error", () => {
        setApi(null);
        setSignerApi(null);
        setProviderApi(null);
      });
      api.on("ready", () => {
        setApi((prev) => prev ?? api);
        setSignerApi((prev) => prev ?? api);
        setProviderApi((prev) => prev ?? api);
      });
      api.on("disconnected", () => {
        setApi(null);
        setSignerApi(null);
        setProviderApi(null);
      });
    }

    return () => {
      api?.off("error", () => undefined);
      api?.off("ready", () => undefined);
      api?.off("connected", () => undefined);
      api?.off("disconnected", () => undefined);

      setApi(null);
      setSignerApi(null);
      setProviderApi(null);
      setAccounts(null);
      setCurrentAccount(null);
    };
  }, [sourceChain]);

  useEffect(() => {
    let sub$$: Subscription;

    if (isEthApi(providerApi)) {
      sub$$ = from(providerApi.getNetwork()).subscribe(({ chainId }) => {
        setCurrentChainId(chainId);
      });
    } else if (isPolkadotApi(providerApi)) {
      setCurrentChainId(null);
    } else {
      setCurrentChainId(null);
    }

    return () => {
      if (sub$$) {
        sub$$.unsubscribe();
      }
    };
  }, [providerApi]);

  return (
    <ApiContext.Provider
      value={{
        api,
        signerApi,
        providerApi,
        accounts,
        currentAccount,
        currentChainId,
        requestAccounts,
        setCurrentAccount,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => useContext(ApiContext);
