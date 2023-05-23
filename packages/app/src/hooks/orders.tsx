import { useEffect, useState } from "react";
import { useApolloClient } from "@apollo/client";
import { Subscription, from } from "rxjs";
import type { OrdersData, OrderEntity, RelayerEntity } from "../types";
import { useMarket } from "./market";
import {
  isEthChain,
  isPolkadotChain,
  transformOrdersOverviewEthData,
  transformOrdersOverviewPolkadotData,
} from "../utils";
import { ORDERS_OVERVIEW_ETH_DATA, ORDERS_OVERVIEW_POLKADOT_DATA } from "../config";

export const useOrders = () => {
  const apolloClient = useApolloClient();
  const { sourceChain, destinationChain } = useMarket();
  const [orders, setOrders] = useState<{ data: OrdersData[]; loading: boolean }>({ data: [], loading: false });

  useEffect(() => {
    let sub$$: Subscription | null = null;

    if (isEthChain(sourceChain)) {
      setOrders((prev) => ({ ...prev, loading: true }));

      sub$$ = from(
        apolloClient.query<{
          orders:
            | (Pick<
                OrderEntity,
                | "lane"
                | "nonce"
                | "sender"
                | "createBlockTime"
                | "finishBlockTime"
                | "createBlockNumber"
                | "finishBlockNumber"
                | "status"
                | "slotIndex"
              > & {
                deliveryRelayers: { deliveryRelayer: Pick<RelayerEntity, "address"> }[] | null;
                confirmationRelayers: { confirmationRelayer: Pick<RelayerEntity, "address"> }[] | null;
              })[];
        }>({
          query: ORDERS_OVERVIEW_ETH_DATA,
          notifyOnNetworkStatusChange: true,
        })
      ).subscribe({
        next: ({ data, loading }) => {
          setOrders({ data: transformOrdersOverviewEthData(data), loading });
        },
        error: (error) => {
          setOrders({ data: [], loading: false });
          console.error(error);
        },
      });
    } else if (isPolkadotChain(sourceChain)) {
      setOrders((prev) => ({ ...prev, loading: true }));

      sub$$ = from(
        apolloClient.query<
          {
            orders: {
              nodes: (Pick<
                OrderEntity,
                | "lane"
                | "nonce"
                | "sender"
                | "createBlockTime"
                | "finishBlockTime"
                | "createBlockNumber"
                | "finishBlockNumber"
                | "status"
                | "slotIndex"
              > & {
                deliveryRelayers: { nodes: { deliveryRelayer: Pick<RelayerEntity, "address"> }[] } | null;
                confirmationRelayers: { nodes: { confirmationRelayer: Pick<RelayerEntity, "address"> }[] } | null;
              })[];
            } | null;
          },
          { destination: string | undefined }
        >({
          query: ORDERS_OVERVIEW_POLKADOT_DATA,
          variables: { destination: destinationChain },
          notifyOnNetworkStatusChange: true,
        })
      ).subscribe({
        next: ({ data, loading }) => {
          setOrders({ data: transformOrdersOverviewPolkadotData(data), loading });
        },
        error: (error) => {
          setOrders({ data: [], loading: false });
          console.error(error);
        },
      });
    }

    return () => {
      sub$$?.unsubscribe();
      setOrders({ data: [], loading: false });
    };
  }, [sourceChain, destinationChain, apolloClient]);

  return { orders };
};
