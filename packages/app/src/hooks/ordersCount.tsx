import { useEffect, useState } from "react";
import { useApolloClient } from "@apollo/client";
import { Subscription, from } from "rxjs";
import { useMarket } from "./market";
import { isEthChain, isPolkadotChain, transformOrdersCountData } from "../utils";
import { ORDERS_COUNT_ETH_DATA, ORDERS_COUNT_POLKADOT_DATA } from "../config";
import type { FeeMarketChain, OrderEntity } from "../types";

interface State {
  data: [number, number][];
  loading: boolean;
}

export const useOrdersCount = () => {
  const { sourceChain, destinationChain } = useMarket();
  const apolloClient = useApolloClient();
  const [ordersCount, setOrdersCount] = useState<State>({ data: [], loading: false });

  useEffect(() => {
    let sub$$: Subscription | null = null;

    if (isEthChain(sourceChain)) {
      setOrdersCount((prev) => ({ ...prev, loading: true }));

      sub$$ = from(
        apolloClient.query<{ orders: Pick<OrderEntity, "createBlockTime">[] | null }>({
          query: ORDERS_COUNT_ETH_DATA,
          notifyOnNetworkStatusChange: true,
        })
      ).subscribe({
        next: ({ data, loading }) => {
          setOrdersCount({ data: transformOrdersCountData(data), loading });
        },
        error: (error) => {
          setOrdersCount({ data: [], loading: false });
          console.error(error);
        },
      });
    } else if (isPolkadotChain(sourceChain)) {
      setOrdersCount((prev) => ({ ...prev, loading: true }));

      sub$$ = from(
        apolloClient.query<
          { orders: { nodes: Pick<OrderEntity, "createBlockTime">[] } | null },
          { destination: FeeMarketChain | undefined }
        >({
          query: ORDERS_COUNT_POLKADOT_DATA,
          variables: {
            destination: destinationChain,
          },
          notifyOnNetworkStatusChange: true,
        })
      ).subscribe({
        next: ({ data, loading }) => {
          setOrdersCount({ data: transformOrdersCountData(data), loading });
        },
        error: (error) => {
          setOrdersCount({ data: [], loading: false });
          console.error(error);
        },
      });
    }

    return () => {
      sub$$?.unsubscribe();
      setOrdersCount({ data: [], loading: false });
    };
  }, [sourceChain, destinationChain, apolloClient]);

  return { ordersCount };
};
