import { useEffect, useState } from "react";
import { RELAYER_ORDERS_ETH_DATA, RELAYER_ORDERS_POLKADOT_DATA } from "../config";
import {
  isEthChain,
  isPolkadotChain,
  transformRelayerRelatedOrdersEthData,
  transformRelayerRelatedOrdersPolkadotData,
} from "../utils";
import type { RelayerOrdersDataSource } from "../utils";
import { useMarket } from "./market";
import type { SlashEntity, OrderEntity } from "../types";
import { useRelayer } from "./relayer";
import { Subscription, from } from "rxjs";
import { useApolloClient } from "@apollo/client";

interface State {
  data: RelayerOrdersDataSource[];
  loading: boolean;
}

export const useRelatedOrders = () => {
  const apolloClient = useApolloClient();
  const { relayerAddress } = useRelayer();
  const { sourceChain, destinationChain } = useMarket();
  const [relatedOrders, setRelatedOrders] = useState<State>({ data: [], loading: false });

  useEffect(() => {
    let sub$$: Subscription | null = null;

    if (isEthChain(sourceChain)) {
      setRelatedOrders((prev) => ({ ...prev, loading: true }));

      sub$$ = from(
        apolloClient.query<
          {
            relayer?: {
              slashes:
                | (Pick<SlashEntity, "amount" | "relayerRole"> & {
                    order: Pick<OrderEntity, "lane" | "nonce" | "createBlockTime"> | null;
                  })[]
                | null;
              rewards:
                | (Pick<SlashEntity, "amount" | "relayerRole"> & {
                    order: Pick<OrderEntity, "lane" | "nonce" | "createBlockTime"> | null;
                  })[]
                | null;
            } | null;
          },
          { relayerId: string }
        >({
          query: RELAYER_ORDERS_ETH_DATA,
          variables: {
            relayerId: `${destinationChain}-${relayerAddress.toLowerCase()}`,
          },
          notifyOnNetworkStatusChange: true,
        })
      ).subscribe({
        next: ({ data, loading }) => {
          setRelatedOrders({ data: transformRelayerRelatedOrdersEthData(data), loading });
        },
        error: (error) => {
          setRelatedOrders({ data: [], loading: false });
          console.error(error);
        },
      });
    } else if (isPolkadotChain(sourceChain)) {
      setRelatedOrders((prev) => ({ ...prev, loading: true }));

      sub$$ = from(
        apolloClient.query<
          {
            relayer?: {
              slashes: {
                nodes: (Pick<SlashEntity, "amount" | "relayerRole"> & {
                  order: Pick<OrderEntity, "lane" | "nonce" | "createBlockTime"> | null;
                })[];
              } | null;
              rewards: {
                nodes: (Pick<SlashEntity, "amount" | "relayerRole"> & {
                  order: Pick<OrderEntity, "lane" | "nonce" | "createBlockTime"> | null;
                })[];
              } | null;
            } | null;
          },
          { relayerId: string }
        >({
          query: RELAYER_ORDERS_POLKADOT_DATA,
          variables: {
            relayerId: `${destinationChain}-${relayerAddress}`,
          },
          notifyOnNetworkStatusChange: true,
        })
      ).subscribe({
        next: ({ data, loading }) => {
          setRelatedOrders({ data: transformRelayerRelatedOrdersPolkadotData(data), loading });
        },
        error: (error) => {
          setRelatedOrders({ data: [], loading: false });
          console.error(error);
        },
      });
    }

    return () => {
      sub$$?.unsubscribe();
      setRelatedOrders({ data: [], loading: false });
    };
  }, [sourceChain, destinationChain, relayerAddress, apolloClient]);

  return { relatedOrders };
};
