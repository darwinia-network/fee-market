import { useFeeMarket } from "@feemarket/app-provider";
import { useOrdersData } from "@feemarket/app-hooks";
import { Spinner } from "@darwinia/ui";
import OrdersSummary from "../components/OrdersSummary";
import OrdersTable from "../components/OrdersTable";

const Orders = () => {
  const { currentMarket, setRefresh } = useFeeMarket();

  const { ordersSummaryData, ordersSummaryLoading, ordersTableData, ordersTableLoading } = useOrdersData({
    currentMarket,
    setRefresh,
  });

  return (
    <Spinner isLoading={ordersSummaryLoading || ordersTableLoading || false}>
      <div className={"flex flex-col lg:gap-[1.875rem] gap-[0.9375rem]"}>
        <OrdersSummary
          loading={ordersSummaryLoading}
          orders={{
            finished: ordersSummaryData?.market?.finishedOrders,
            unfinishedInSlot: ordersSummaryData?.market?.unfinishedInSlotOrders,
            unfinishedOutOfSlot: ordersSummaryData?.market?.unfinishedOutOfSlotOrders,
          }}
        />
        <OrdersTable
          ordersTableData={(ordersTableData?.orders?.nodes || [])
            .sort((a, b) => b.createBlockNumber - a.createBlockNumber)
            .map((node, index) => {
              return {
                id: index.toString(),
                orderId: node.nonce,
                lane: node.lane,
                nonce: node.nonce,
                deliveryRelayer: node.deliveryRelayers?.nodes.length
                  ? node.deliveryRelayers.nodes[0].deliveryRelayer.address
                  : "-",
                confirmationRelayer: node.confirmationRelayers?.nodes.length
                  ? node.confirmationRelayers.nodes[0].confirmationRelayer.address
                  : "-",
                createdAt: node.createBlockTime,
                confirmAt: node.finishBlockTime,
                createBlock: node.createBlockNumber,
                confirmBlock: node.finishBlockNumber,
                status: node.status === "Finished" ? "finished" : node.status === "InProgress" ? "inProgress" : "all",
              };
            })}
        />
      </div>
    </Spinner>
  );
};

export default Orders;
