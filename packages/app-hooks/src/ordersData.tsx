import { useGrapgQuery } from "./graphQuery";
import type { Market } from "@feemarket/app-provider";
import { ORDERS_STATISTICS, ORDERS_OVERVIEW } from "@feemarket/app-config";
import {} from "@feemarket/app-utils";
import type { MarketEntity, OrderEntity, RelayerEntity } from "@feemarket/app-types";
import { useEffect } from "react";

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
    loading: ordersTableLoading,
    data: ordersTableData,
    refetch: updateOrdersTableData,
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
    { destination: string | undefined }
  >(ORDERS_OVERVIEW, {
    variables: { destination: currentMarket?.destination },
  });

  useEffect(() => {
    setRefresh(() => () => {
      updateOrdersSummary();
      updateOrdersTableData();
    });
  }, [setRefresh, updateOrdersSummary, updateOrdersTableData]);

  return { ordersSummaryData, ordersSummaryLoading, ordersTableData, ordersTableLoading };
};
