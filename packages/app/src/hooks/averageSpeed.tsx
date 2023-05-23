import { useQuery } from "@apollo/client";
import { MARKET_SUMMARY } from "../config";
import type { FeeMarketChain, MarketEntity } from "../types";
import { useMarket } from "./market";

interface State {
  value: number | string | null | undefined; //in milliseconds
  loading: boolean;
}

export const useAverageSpeed = () => {
  const { currentMarket } = useMarket();
  const destinationChain = currentMarket?.destination;

  const { loading, data } = useQuery<
    { market: Pick<MarketEntity, "averageSpeed"> | null },
    { destination: FeeMarketChain | undefined }
  >(MARKET_SUMMARY, {
    notifyOnNetworkStatusChange: true,
    variables: {
      destination: destinationChain,
    },
  });

  return { averageSpeed: { loading, value: data?.market?.averageSpeed } as State };
};
