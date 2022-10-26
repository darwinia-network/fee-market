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
      <div className={"flex flex-col lg:gap-[1.875rem] gap-[0.9375rem] min-h-[38rem]"}>
        <OrdersSummary
          loading={ordersSummaryLoading}
          orders={{
            finished: ordersSummaryData?.market?.finishedOrders,
            unfinishedInSlot: ordersSummaryData?.market?.unfinishedInSlotOrders,
            unfinishedOutOfSlot: ordersSummaryData?.market?.unfinishedOutOfSlotOrders,
          }}
        />
        <OrdersTable
          data={[...ordersTableData]
            .sort((a, b) => b.createBlockNumber - a.createBlockNumber)
            .map((item, index) => {
              return {
                id: index.toString(),
                lane: item.lane,
                nonce: item.nonce,
                sender: item.sender,
                status: item.status,
                slotIndex: item.slotIndex,
                deliveryRelayer: item.deliveryRelayers.length ? item.deliveryRelayers[0].address : null,
                confirmationRelayer: item.confirmationRelayers.length ? item.confirmationRelayers[0].address : null,
                createdAt: item.createBlockTime,
                confirmedAt: item.finishBlockTime,
                createBlock: item.createBlockNumber,
                confirmedBlock: item.finishBlockNumber,
              };
            })}
        />
      </div>
    </Spinner>
  );
};

export default Orders;
