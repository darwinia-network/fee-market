import { from, Subscription } from "rxjs";
import { providers } from "ethers";
import type { u16 } from "@polkadot/types";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { encodeAddress } from "@polkadot/util-crypto";
import { web3Accounts, web3Enable } from "@polkadot/extension-dapp";
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useState } from "react";
import { useMarket } from "@feemarket/market";
import type {} from "@feemarket/config";
import type { Account } from "@feemarket/types";
import {
  isEthApi,
  isEthChain,
  isPolkadotApi,
  isPolkadotChain,
  getEthChainConfig,
  getPolkadotChainConfig,
} from "@feemarket/utils";
import { GraphqlProvider } from "./graphql";

const DAPP_NAME = "darwinia/feemarket";

export interface ApiCtx {
  signerApi: providers.Provider | ApiPromise | null;
  providerApi: providers.Provider | ApiPromise | null;
  accounts: Account[];
  currentAccount: Account | null;
  currentChainId: number | null;
  requestAccounts: () => Promise<void>;
  setCurrentAccount: (account: Account) => void;
}

const defaultValue: ApiCtx = {
  signerApi: null,
  providerApi: null,
  accounts: [],
  currentAccount: null,
  currentChainId: null,
  requestAccounts: async () => undefined,
  setCurrentAccount: () => undefined,
};

export const ApiContext = createContext<ApiCtx>(defaultValue);

export const ApiProvider = ({ children }: PropsWithChildren<unknown>) => {
  const { currentMarket } = useMarket();
  const [signerApi, setSignerApi] = useState<providers.Provider | ApiPromise | null>(null);
  const [providerApi, setProviderApi] = useState<providers.Provider | ApiPromise | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
  const [currentChainId, setCurrentChainId] = useState<number | null>(null);

  const sourceChain = currentMarket?.source;

  const requestAccounts = useCallback(async () => {
    if (isEthApi(signerApi)) {
      const allAccounts = ((await signerApi.send("eth_requestAccounts", [])) as string[]).map(
        (address) => ({ address, originAddress: address } as Account)
      );
      setAccounts(allAccounts);
      setCurrentAccount(allAccounts[0] || null);
    } else if (isPolkadotApi(signerApi)) {
      await web3Enable(DAPP_NAME);

      const ss58Prefix = (signerApi.consts.system.ss58Prefix as u16).toNumber();
      const allAccounts = (await web3Accounts()).map(
        ({ address, meta }) =>
          ({
            address: encodeAddress(address, ss58Prefix),
            originAddress: address,
            meta,
          } as Account)
      );

      setAccounts(allAccounts);
      setCurrentAccount(allAccounts[0] || null);
    }
  }, [signerApi]);

  useEffect(() => {
    let api: ApiPromise | null = null;

    if (isEthChain(sourceChain)) {
      const rpc = getEthChainConfig(sourceChain).provider.rpc;
      if (rpc.startsWith("ws")) {
        setProviderApi(new providers.WebSocketProvider(rpc));
      } else if (rpc.startsWith("http")) {
        setProviderApi(new providers.JsonRpcProvider(rpc));
      }

      if (typeof window.ethereum !== "undefined") {
        const provider = new providers.Web3Provider(window.ethereum);
        setSignerApi(provider);

        window.ethereum.on("chainChanged", () => {
          const provider = new providers.Web3Provider(window.ethereum);
          setSignerApi(provider);
        });

        window.ethereum.on("accountsChanged", (accs: string[]) => {
          setAccounts(accs.map((address) => ({ address, originAddress: address } as Account)));
          setCurrentAccount((prev) => (accs.some((item) => item === prev?.address) ? prev : null));
        });
      }
    } else if (isPolkadotChain(sourceChain)) {
      const injecteds = window.injectedWeb3;
      const haveWallet =
        injecteds &&
        (injecteds["polkadot-js"] ||
          injecteds['"polkadot-js"'] ||
          injecteds["talisman"] ||
          injecteds['"talisman"'] ||
          injecteds["subwallet-js"] ||
          injecteds['"subwallet-js"']);

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

      setSignerApi(null);
      setProviderApi(null);
      setAccounts([]);
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
    }

    return () => {
      if (sub$$) {
        sub$$.unsubscribe();
        setCurrentChainId(null);
      }
    };
  }, [providerApi]);

  return (
    <GraphqlProvider>
      <ApiContext.Provider
        value={{
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
    </GraphqlProvider>
  );
};

export const useApi = () => useContext(ApiContext);
