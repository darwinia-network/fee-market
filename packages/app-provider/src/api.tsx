import { ApiPromise, WsProvider } from "@polkadot/api";
import { providers } from "ethers";
import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { useFeeMarket } from "./feemarket";
import { ETH_CHAIN_CONF, POLKADOT_CHAIN_CONF } from "@feemarket/app-config";
import type { FeeMarketSourceChainEth, FeeMarketSourceChainPolkadot } from "@feemarket/app-types";
import { isEthApi, isPolkadotApi, isEthChain, isPolkadotChain } from "@feemarket/app-utils";

export interface ApiCtx {
  apiPolkadot: ApiPromise | null;
  apiEth: providers.Web3Provider | null;
  api: providers.Web3Provider | ApiPromise | null;
}

const defaultValue: ApiCtx = {
  api: null,
  apiEth: null,
  apiPolkadot: null,
};

export const ApiContext = createContext<ApiCtx>(defaultValue);

export const ApiProvider = ({ children }: PropsWithChildren<unknown>) => {
  const { currentMarket } = useFeeMarket();
  const [apiEth, setApiEth] = useState<providers.Web3Provider | null>(null);
  const [apiPolkadot, setApiPolkadot] = useState<ApiPromise | null>(null);
  const [api, setApi] = useState<providers.Web3Provider | ApiPromise | null>(null);

  useEffect(() => {
    if (currentMarket?.source) {
      if (ETH_CHAIN_CONF[currentMarket.source as FeeMarketSourceChainEth]) {
        setApi(new providers.Web3Provider(window.ethereum));
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

  useEffect(() => {
    if (isEthApi(api)) {
      console.log("api: eth");
    } else if (isPolkadotApi(api)) {
      console.log("api: polkadot");
    } else {
      console.log("api: unknown");
    }
  }, [api]);

  useEffect(() => {
    setApiPolkadot(null);
  }, []);

  return (
    <ApiContext.Provider
      value={{
        api,
        apiEth,
        apiPolkadot,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => useContext(ApiContext);
