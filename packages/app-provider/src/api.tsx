import { ApiPromise, WsProvider } from "@polkadot/api";
import { providers } from "ethers";
import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { useFeeMarket } from "./feemarket";
import { POLKADOT_CHAIN_CONF } from "@feemarket/app-config";

export interface ApiCtx {
  apiPolkadot: ApiPromise | null;
  apiEth: providers.Web3Provider | null;
}

const defaultValue: ApiCtx = {
  apiEth: null,
  apiPolkadot: null,
};

export const ApiContext = createContext<ApiCtx>(defaultValue);

export const ApiProvider = ({ children }: PropsWithChildren<unknown>) => {
  const { currentMarket } = useFeeMarket();
  const [apiEth, setApiEth] = useState<providers.Web3Provider | null>(null);
  const [apiPolkadot, setApiPolkadot] = useState<ApiPromise | null>(null);

  useEffect(() => {
    if (currentMarket?.source) {
      const provider = new WsProvider(POLKADOT_CHAIN_CONF[currentMarket.source].provider.rpc);
      ApiPromise.create({ provider })
        .then((api) => {
          setApiPolkadot(api);
        })
        .catch((error) => {
          console.error("Create polkadot api:", error);
        });
    } else {
      setApiEth(null);
    }
  }, [currentMarket]);

  useEffect(() => {
    setApiPolkadot(null);
  }, []);

  return (
    <ApiContext.Provider
      value={{
        apiEth,
        apiPolkadot,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => useContext(ApiContext);
