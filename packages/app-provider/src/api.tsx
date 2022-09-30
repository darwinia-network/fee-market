import type { ApiPromise } from "@polkadot/api";
import { providers } from "ethers";
import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";

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
  const [apiEth, setApiEth] = useState<providers.Web3Provider | null>(null);
  const [apiPolkadot, setApiPolkadot] = useState<ApiPromise | null>(null);

  useEffect(() => {
    setApiEth(null);
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
