import { useNavigate } from "react-router-dom";
import { createContext, PropsWithChildren, useState, useCallback, useEffect } from "react";
import { parseUrlChainName, formatUrlChainName } from "../utils";
import { UrlSearchParamsKey, Market } from "../types";
interface MarketCtx {
  currentMarket: Market | null;
  setCurrentMarket: (market: Market) => void;
  refresh: () => void;
  setRefresh: (fn: () => void) => void;
  cleanUp: () => void; // clean up some state of some pages
  setCleanUp: (fn: () => void) => void;
}

const defaultValue: MarketCtx = {
  currentMarket: null,
  setCurrentMarket: () => undefined,
  refresh: () => undefined,
  setRefresh: () => undefined,
  cleanUp: () => undefined,
  setCleanUp: () => undefined,
};

export const MarketContext = createContext<MarketCtx>(defaultValue);

export const MarketProvider = ({ children }: PropsWithChildren<unknown>) => {
  const navigate = useNavigate();
  const [currentMarket, _setCurrentMarket] = useState<Market | null>(null);
  const [refresh, setRefresh] = useState<() => void>(() => () => undefined);
  const [cleanUp, setCleanUp] = useState<() => void>(() => () => undefined);

  const setCurrentMarket = useCallback(
    (market: Market | null) => {
      _setCurrentMarket(market);

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
      _setCurrentMarket({ source: "Ethereum", destination: "Darwinia Smart Chain" });
    }
  }, []);

  return (
    <MarketContext.Provider
      value={{
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
