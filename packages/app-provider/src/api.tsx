import { ApiPromise, WsProvider } from "@polkadot/api";
import { providers } from "ethers";
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useState } from "react";
import { useFeeMarket } from "./feemarket";
import { ETH_CHAIN_CONF, POLKADOT_CHAIN_CONF } from "@feemarket/app-config";
import type { FeeMarketSourceChainEth, FeeMarketSourceChainPolkadot } from "@feemarket/app-types";
import { isEthApi, isPolkadotApi, isEthChain, isPolkadotChain } from "@feemarket/app-utils";

export interface ApiCtx {
  apiPolkadot: ApiPromise | null;
  apiEth: providers.Web3Provider | null;
  api: providers.Web3Provider | ApiPromise | null;
  accounts: string[] | null;
  requestAccounts: () => Promise<void>;
}

const defaultValue: ApiCtx = {
  api: null,
  apiEth: null,
  apiPolkadot: null,
  accounts: null,
  requestAccounts: async () => undefined,
};

export const ApiContext = createContext<ApiCtx>(defaultValue);

export const ApiProvider = ({ children }: PropsWithChildren<unknown>) => {
  const { currentMarket } = useFeeMarket();
  const [apiEth, setApiEth] = useState<providers.Web3Provider | null>(null);
  const [apiPolkadot, setApiPolkadot] = useState<ApiPromise | null>(null);
  const [api, setApi] = useState<providers.Web3Provider | ApiPromise | null>(null);
  const [accounts, setAccounts] = useState<string[] | null>(null);

  const requestAccounts = useCallback(async () => {
    if (isEthApi(api)) {
      setAccounts(await api.send("eth_requestAccounts", []));
    } else if (isPolkadotApi(api)) {
      // TODO
      setAccounts([]);
    } else {
      setAccounts(null);
    }
  }, [api]);

  useEffect(() => {
    if (currentMarket?.source) {
      if (ETH_CHAIN_CONF[currentMarket.source as FeeMarketSourceChainEth]) {
        if (typeof window.ethereum !== "undefined") {
          setApi(new providers.Web3Provider(window.ethereum));

          window.ethereum.on("chainChanged", () => {
            setApi(new providers.Web3Provider(window.ethereum));
          });

          window.ethereum.on("accountsChanged", (accs: string[]) => {
            setAccounts(accs);
          });
        }
      } else if (POLKADOT_CHAIN_CONF[currentMarket.source as FeeMarketSourceChainPolkadot]) {
        const provider = new WsProvider(
          POLKADOT_CHAIN_CONF[currentMarket.source as FeeMarketSourceChainPolkadot].provider.rpc
        );
        ApiPromise.create({ provider })
          .then((api) => {
            setApi(api);
            setApiPolkadot(api);
          })
          .catch((error) => {
            console.error("Create api:", error);
          });
      }
    } else {
      setApi(null);
      setApiEth(null);
      setApiPolkadot(null);
    }
  }, [currentMarket]);

  useEffect(() => {
    if (isEthChain(currentMarket?.source)) {
      console.log(currentMarket?.source, "is Eth Chain");
    } else if (isPolkadotChain(currentMarket?.source)) {
      console.log(currentMarket?.source, "is Polkadot Chain");
    } else {
      console.log(currentMarket?.source, "is Unknown Chain");
    }
  }, [currentMarket?.source]);

  return (
    <ApiContext.Provider
      value={{
        api,
        apiEth,
        apiPolkadot,
        accounts,
        requestAccounts,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => useContext(ApiContext);
