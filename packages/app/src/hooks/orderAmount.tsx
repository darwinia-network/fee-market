import { useQuery } from "@apollo/client";
import { ORDERS_SUMMARY_DATA } from "../config";
import type { MarketEntity } from "../types";
import { useMarket } from "./market";

interface State {
  finished: number | null | undefined;
  unfinished: {
    inSlot: number | null | undefined;
    outOfSlot: number | null | undefined;
  };
  loading: boolean;
}

export const useOrderAmount = () => {
  const { currentMarket } = useMarket();

  const destinationChain = currentMarket?.destination;

  const { data, loading } = useQuery<
    { market: Pick<MarketEntity, "finishedOrders" | "unfinishedInSlotOrders" | "unfinishedOutOfSlotOrders"> | null },
    { destination: string | undefined }
  >(ORDERS_SUMMARY_DATA, {
    notifyOnNetworkStatusChange: true,
    variables: {
      destination: destinationChain,
    },
  });

  return {
    orderAmount: {
      finished: data?.market?.finishedOrders,
      unfinished: { inSlot: data?.market?.unfinishedInSlotOrders, outOfSlot: data?.market?.unfinishedOutOfSlotOrders },
      loading,
    } as State,
  };
};
