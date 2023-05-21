import { useQuery } from "@apollo/client";
import { MARKET_SUMMARY } from "../config";
import type { FeeMarketChain, MarketEntity } from "../types";
import { useMarket } from "./market";

interface State {
  value: number | null | undefined;
  loading: boolean;
}

export const useTotalOrders = () => {
  const { currentMarket } = useMarket();
  const destinationChain = currentMarket?.destination;

  const { loading, data } = useQuery<
    { market: Pick<MarketEntity, "totalOrders"> | null },
    { destination: FeeMarketChain | undefined }
  >(MARKET_SUMMARY, {
    notifyOnNetworkStatusChange: true,
    variables: {
      destination: destinationChain,
    },
  });

  return { totalOrders: { loading, value: data?.market?.totalOrders } as State };
};
