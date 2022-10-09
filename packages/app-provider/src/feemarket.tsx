import { UrlSearchParamsKey } from "@feemarket/app-types";
import type { FeeMarketChain, FeeMarketSourceChan } from "@feemarket/app-types";
import { createContext, PropsWithChildren, useState, useContext, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MAPPING_CHAIN_2_URL_SEARCH_PARAM, MAPPING_URL_SEARCH_PARAM_2_CHAIN } from "@feemarket/app-config";

export interface Market {
  source: FeeMarketSourceChan;
  destination: FeeMarketChain;
}

interface FeeMarketCtx {
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

const FeeMarketContext = createContext<FeeMarketCtx>(defaultValue);

export const FeeMarketProvider = ({ children }: PropsWithChildren<unknown>) => {
  const navigate = useNavigate();
  const { search, pathname } = useLocation();
  const [currentMarket, _setCurrentMarket] = useState<Market | null>(null);
  const [refresh, setRefresh] = useState<() => void>(() => () => undefined);

  const setCurrentMarket = useCallback(
    (market: Market | null) => {
      _setCurrentMarket(market);

      const urlSearchParams = new URLSearchParams(search);

      if (market) {
        urlSearchParams.set(UrlSearchParamsKey.FROM, MAPPING_CHAIN_2_URL_SEARCH_PARAM[market.source]);
        urlSearchParams.set(UrlSearchParamsKey.TO, MAPPING_CHAIN_2_URL_SEARCH_PARAM[market.destination]);
      } else {
        urlSearchParams.delete(UrlSearchParamsKey.FROM);
        urlSearchParams.delete(UrlSearchParamsKey.TO);
      }

      if (urlSearchParams.toString().length) {
        navigate(`${pathname}?${urlSearchParams.toString()}`);
      }
    },
    [navigate]
  );

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(search);
    const source = urlSearchParams.get(UrlSearchParamsKey.FROM);
    const destination = urlSearchParams.get(UrlSearchParamsKey.TO);

    if (source && destination) {
      _setCurrentMarket({
        source: MAPPING_URL_SEARCH_PARAM_2_CHAIN[source] as FeeMarketSourceChan,
        destination: MAPPING_URL_SEARCH_PARAM_2_CHAIN[destination],
      });
    }
  }, []);

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
