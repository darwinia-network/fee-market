import { useCallback, useEffect, useMemo } from "react";
import type { OrdersData } from "@feemarket/utils";
import { useMarket } from "@feemarket/market";
import type { MarketEntity, OrderEntity, RelayerEntity } from "@feemarket/config";
import { ORDERS_SUMMARY_DATA, ORDERS_OVERVIEW_ETH_DATA, ORDERS_OVERVIEW_POLKADOT_DATA } from "@feemarket/config";
import { transformOrdersOverviewEthData, transformOrdersOverviewPolkadotData } from "@feemarket/utils";
import { useGrapgQuery } from "./graphQuery";

export const useOrdersOverviewData = () => {
  const { currentMarket, setRefresh } = useMarket();
  const destinationChain = currentMarket?.destination;

  const {
    loading: ordersSummaryDataLoading,
    data: ordersSummaryData,
    refetch: updateOrdersSummaryData,
  } = useGrapgQuery<
    { market: Pick<MarketEntity, "finishedOrders" | "unfinishedInSlotOrders" | "unfinishedOutOfSlotOrders"> | null },
    { destination: string | undefined }
  >(ORDERS_SUMMARY_DATA, {
    variables: { destination: destinationChain },
  });

  const {
    transformedData: ordersOverviewEthData,
    loading: ordersOverviewEthDataLoading,
    refetch: updateOrdersOverviewEthData,
  } = useGrapgQuery<
    {
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
    },
    unknown,
    OrdersData[]
  >(ORDERS_OVERVIEW_ETH_DATA, {}, transformOrdersOverviewEthData);

  const {
    transformedData: ordersOverviewPolkadotData,
    loading: ordersOverviewPolkadotDataLoading,
    refetch: updateOrdersOverviewPolkadotData,
  } = useGrapgQuery<
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
    { destination: string | undefined },
    OrdersData[]
  >(
    ORDERS_OVERVIEW_POLKADOT_DATA,
    {
      variables: { destination: destinationChain },
    },
    transformOrdersOverviewPolkadotData
  );

  const ordersOverviewDataLoading = useMemo(() => {
    return ordersOverviewEthDataLoading ?? ordersOverviewPolkadotDataLoading ?? false;
  }, [ordersOverviewEthDataLoading, ordersOverviewPolkadotDataLoading]);

  const ordersOverviewData = useMemo(() => {
    if (ordersOverviewEthData?.length) {
      return ordersOverviewEthData;
    }
    if (ordersOverviewPolkadotData?.length) {
      return ordersOverviewPolkadotData;
    }
    return [];
  }, [ordersOverviewEthData, ordersOverviewPolkadotData]);

  const updateOrdersOverviewData = useCallback(() => {
    updateOrdersOverviewEthData();
    updateOrdersOverviewPolkadotData();
  }, [updateOrdersOverviewEthData, updateOrdersOverviewPolkadotData]);

  useEffect(() => {
    setRefresh(() => () => {
      updateOrdersSummaryData();
      updateOrdersOverviewData();
    });
  }, [setRefresh, updateOrdersSummaryData, updateOrdersOverviewData]);

  return { ordersSummaryData, ordersSummaryDataLoading, ordersOverviewData, ordersOverviewDataLoading };
};
