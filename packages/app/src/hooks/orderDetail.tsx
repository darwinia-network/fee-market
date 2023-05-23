import { useEffect, useState } from "react";
import { useApolloClient } from "@apollo/client";
import { Subscription, from } from "rxjs";
import { ORDER_DETAIL_ETH_DATA, ORDER_DETAIL_POLKADOT_DATA } from "../config";
import { isEthChain, isPolkadotChain, transformOrderDetailEthData, transformOrderDetailPolkadotData } from "../utils";
import type { OrderDetail, SlashEntity, RelayerEntity, OrderEntity, RewardEntity } from "../types";
import { useMarket } from "./market";

interface State {
  value: OrderDetail | null;
  loading: boolean;
}

export const useOrderDetail = (lane: string | null, nonce: string | null) => {
  const apolloClient = useApolloClient();
  const { sourceChain, destinationChain } = useMarket();
  const [orderDetail, setOrderDetail] = useState<State>({ value: null, loading: false });

  useEffect(() => {
    let sub$$: Subscription | null = null;

    if (isEthChain(sourceChain)) {
      setOrderDetail((prev) => ({ ...prev, loading: true }));

      sub$$ = from(
        apolloClient.query<
          {
            order:
              | (Pick<
                  OrderEntity,
                  | "lane"
                  | "nonce"
                  | "fee"
                  | "sender"
                  | "sourceTxHash"
                  | "slotIndex"
                  | "status"
                  | "createBlockTime"
                  | "finishBlockTime"
                  | "createBlockNumber"
                  | "finishBlockNumber"
                  | "treasuryAmount"
                  | "assignedRelayersAddress"
                > & {
                  slashes: (Pick<SlashEntity, "amount" | "relayerRole" | "blockNumber" | "txHash"> & {
                    relayer: Pick<RelayerEntity, "address">;
                  })[];
                  rewards: (Pick<RewardEntity, "amount" | "relayerRole" | "blockNumber" | "txHash"> & {
                    relayer: Pick<RelayerEntity, "address">;
                  })[];
                })
              | null;
          },
          { orderId: string }
        >({
          query: ORDER_DETAIL_ETH_DATA,
          variables: { orderId: `${lane}-${nonce}` },
          notifyOnNetworkStatusChange: true,
        })
      ).subscribe({
        next: ({ data, loading }) => {
          setOrderDetail({ value: transformOrderDetailEthData(data), loading });
        },
        error: (error) => {
          setOrderDetail({ value: null, loading: false });
          console.error(error);
        },
      });
    } else if (isPolkadotChain(sourceChain)) {
      setOrderDetail((prev) => ({ ...prev, loading: true }));

      sub$$ = from(
        apolloClient.query<
          {
            order:
              | (Pick<
                  OrderEntity,
                  | "lane"
                  | "nonce"
                  | "fee"
                  | "sender"
                  | "sourceTxHash"
                  | "slotIndex"
                  | "status"
                  | "createBlockTime"
                  | "finishBlockTime"
                  | "createBlockNumber"
                  | "finishBlockNumber"
                  | "treasuryAmount"
                  | "assignedRelayersAddress"
                > & {
                  slashes: {
                    nodes: (Pick<SlashEntity, "amount" | "relayerRole" | "blockNumber" | "extrinsicIndex"> & {
                      relayer: Pick<RelayerEntity, "address">;
                    })[];
                  } | null;
                  rewards: {
                    nodes: (Pick<RewardEntity, "amount" | "relayerRole" | "blockNumber" | "extrinsicIndex"> & {
                      relayer: Pick<RelayerEntity, "address">;
                    })[];
                  } | null;
                })
              | null;
          },
          { orderId: string }
        >({
          query: ORDER_DETAIL_POLKADOT_DATA,
          variables: { orderId: `${destinationChain}-${lane}-${nonce}` },
          notifyOnNetworkStatusChange: true,
        })
      ).subscribe({
        next: ({ data, loading }) => {
          setOrderDetail({ value: transformOrderDetailPolkadotData(data), loading });
        },
        error: (error) => {
          setOrderDetail({ value: null, loading: false });
          console.error(error);
        },
      });
    }

    return () => {
      sub$$?.unsubscribe();
      setOrderDetail({ value: null, loading: false });
    };
  }, [sourceChain, destinationChain, apolloClient, lane, nonce]);

  return { orderDetail };
};
