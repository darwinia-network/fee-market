import { useNavigate } from "react-router-dom";
import { createContext, PropsWithChildren, useState, useCallback, useEffect, useMemo } from "react";
import { parseUrlChainName, formatUrlChainName } from "../utils";
import { UrlSearchParamsKey, Market, FeeMarketChain } from "../types";
interface MarketCtx {
  currentMarket: Market | null;
  sourceChain: FeeMarketChain | undefined;
  destinationChain: FeeMarketChain | undefined;
  setCurrentMarket: (market: Market) => void;
}

const defaultValue: MarketCtx = {
  currentMarket: null,
  sourceChain: undefined,
  destinationChain: undefined,
  setCurrentMarket: () => undefined,
};

export const MarketContext = createContext<MarketCtx>(defaultValue);

export const MarketProvider = ({ children }: PropsWithChildren<unknown>) => {
  const navigate = useNavigate();
  const [currentMarket, _setCurrentMarket] = useState<Market | null>(null);

  const { sourceChain, destinationChain } = useMemo(() => {
    return { sourceChain: currentMarket?.source, destinationChain: currentMarket?.destination };
  }, [currentMarket]);

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
        sourceChain,
        destinationChain,
        setCurrentMarket,
      }}
    >
      {children}
    </MarketContext.Provider>
  );
};
