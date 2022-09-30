import type { FeeMarketPolkadotChain } from "@feemarket/app-types";
import { createContext, PropsWithChildren, useState, useContext } from "react";

interface Market {
  source: Extract<FeeMarketPolkadotChain, "Crab" | "Darwinia" | "Pangolin" | "Pangoro">;
  destination: FeeMarketPolkadotChain;
}

export interface FeeMarketCtx {
  currentMarket: Market | null;
  setCurrentMarket: (market: Market) => void;
  refresh: () => void;
  setRefresh: (fn: () => void) => void;
}

const defaultValue: FeeMarketCtx = {
  currentMarket: null,
  setCurrentMarket: () => undefined,
  refresh: () => undefined,
  setRefresh: () => undefined,
};

export const FeeMarketContext = createContext<FeeMarketCtx>(defaultValue);

export const FeeMarketProvider = ({ children }: PropsWithChildren<unknown>) => {
  const [currentMarket, setCurrentMarket] = useState<Market | null>(null);
  const [refresh, setRefresh] = useState<() => void>(() => () => undefined);

  return (
    <FeeMarketContext.Provider
      value={{
        currentMarket,
        setCurrentMarket,
        refresh,
        setRefresh,
      }}
    >
      {children}
    </FeeMarketContext.Provider>
  );
};

export const useFeeMarket = () => useContext(FeeMarketContext);
