import { useNavigate } from "react-router-dom";
import { createContext, PropsWithChildren, useState, useContext, useCallback, useEffect } from "react";
import { parseUrlChainName, formatUrlChainName, isEthChain, isPolkadotChain } from "@feemarket/utils";
import { UrlSearchParamsKey } from "@feemarket/types";
import type { FeeMarketChain } from "@feemarket/config";

export interface Market {
  source: FeeMarketChain;
  destination: FeeMarketChain;
}

interface MarketCtx {
  walletChangeCount: number; // metamask <=> polkadot{.js}
  currentMarket: Market | null;
  setCurrentMarket: (market: Market) => void;
  refresh: () => void;
  setRefresh: (fn: () => void) => void;
  cleanUp: () => void; // clean up some state of some pages
  setCleanUp: (fn: () => void) => void;
}

const defaultValue: MarketCtx = {
  walletChangeCount: 0,
  currentMarket: null,
  setCurrentMarket: () => undefined,
  refresh: () => undefined,
  setRefresh: () => undefined,
  cleanUp: () => undefined,
  setCleanUp: () => undefined,
};

const MarketContext = createContext<MarketCtx>(defaultValue);

export const MarketProvider = ({ children }: PropsWithChildren<unknown>) => {
  const navigate = useNavigate();
  const [walletChangeCount, setWalletChangeCount] = useState(0);
  const [currentMarket, _setCurrentMarket] = useState<Market | null>(null);
  const [refresh, setRefresh] = useState<() => void>(() => () => undefined);
  const [cleanUp, setCleanUp] = useState<() => void>(() => () => undefined);

  const setCurrentMarket = useCallback(
    (market: Market | null) => {
      _setCurrentMarket((prev) => {
        if (isEthChain(prev?.source) && !isEthChain(market?.source)) {
          setWalletChangeCount((prev) => prev + 1);
        } else if (isPolkadotChain(prev?.source) && !isPolkadotChain(market?.source)) {
          setWalletChangeCount((prev) => prev + 1);
        }
        return market;
      });

      const urlSearchParams = new URLSearchParams(window.location.search);

      if (market) {
        urlSearchParams.set(UrlSearchParamsKey.FROM, formatUrlChainName(market.source));
        urlSearchParams.set(UrlSearchParamsKey.TO, formatUrlChainName(market.destination));
      } else {
        urlSearchParams.delete(UrlSearchParamsKey.FROM);
        urlSearchParams.delete(UrlSearchParamsKey.TO);
      }

      if (urlSearchParams.toString().length) {
        navigate(`?${urlSearchParams.toString()}`);
      }
    },
    [navigate]
  );

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const urlSource = urlSearchParams.get(UrlSearchParamsKey.FROM);
    const urlDestination = urlSearchParams.get(UrlSearchParamsKey.TO);

    if (urlSource && urlDestination) {
      const source = parseUrlChainName(urlSource);
      const destination = parseUrlChainName(urlDestination);
      if (source && destination) {
        _setCurrentMarket({ source, destination });
      }
    } else {
      _setCurrentMarket({ source: "Crab", destination: "Darwinia" });
    }
  }, []);

  return (
    <MarketContext.Provider
      value={{
        walletChangeCount,
        currentMarket,
        setCurrentMarket,
        refresh,
        setRefresh,
        cleanUp,
        setCleanUp,
      }}
    >
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => useContext(MarketContext);
