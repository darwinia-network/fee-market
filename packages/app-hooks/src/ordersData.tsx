import { useGrapgQuery } from "./graphQuery";
import type { Market } from "@feemarket/app-provider";
import { ORDERS_STATISTICS, ORDERS_OVERVIEW_ETH, ORDERS_OVERVIEW_POLKADOT } from "@feemarket/app-config";
import { transformEthOrdersData, transformPolkadotOrdersData } from "@feemarket/app-utils";
import type { MarketEntity, OrderEntity, RelayerEntity, OrdersData } from "@feemarket/app-types";
import { useCallback, useEffect, useMemo } from "react";

interface Params {
  currentMarket: Market | null;
  setRefresh: (fn: () => void) => void;
}

export const useOrdersData = ({ currentMarket, setRefresh }: Params) => {
  const {
    loading: ordersSummaryLoading,
    data: ordersSummaryData,
    refetch: updateOrdersSummary,
  } = useGrapgQuery<
    { market: Pick<MarketEntity, "finishedOrders" | "unfinishedInSlotOrders" | "unfinishedOutOfSlotOrders"> | null },
    { destination: string | undefined }
  >(ORDERS_STATISTICS, {
    variables: { destination: currentMarket?.destination },
  });

  const {
    transformedData: ethOrdersTableData,
    loading: ethOrdersTableLoading,
    refetch: updateEthOrdersTableData,
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
  >(ORDERS_OVERVIEW_ETH, {}, transformEthOrdersData);

  const {
    transformedData: polkadotOrdersTableData,
    loading: polkadotOrdersTableLoading,
    refetch: updatePolkadotOrdersTableData,
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
    ORDERS_OVERVIEW_POLKADOT,
    {
      variables: { destination: currentMarket?.destination },
    },
    transformPolkadotOrdersData
  );

  const ordersTableLoading = useMemo(() => {
    return ethOrdersTableLoading || polkadotOrdersTableLoading;
  }, [ethOrdersTableLoading, polkadotOrdersTableLoading]);

  const ordersTableData = useMemo(() => {
    if (ethOrdersTableData?.length) {
      return ethOrdersTableData;
    }
    if (polkadotOrdersTableData?.length) {
      return polkadotOrdersTableData;
    }
    return [];
  }, [ethOrdersTableData, polkadotOrdersTableData]);

  const updateOrdersTableData = useCallback(() => {
    updateEthOrdersTableData();
    updatePolkadotOrdersTableData();
  }, [updateEthOrdersTableData, updatePolkadotOrdersTableData]);

  useEffect(() => {
    setRefresh(() => () => {
      updateOrdersSummary();
      updateOrdersTableData();
    });
  }, [setRefresh, updateOrdersSummary, updateOrdersTableData]);

  return { ordersSummaryData, ordersSummaryLoading, ordersTableData, ordersTableLoading };
};
