import { useApi } from "@feemarket/api";
import { useOrdersOverviewData } from "@feemarket/hooks";
import { adaptSlotIndex } from "@feemarket/utils";
import { Spinner } from "@darwinia/ui";
import OrdersSummary from "../components/OrdersSummary";
import OrdersTable from "../components/OrdersTable";

const Orders = () => {
  const { providerApi: api } = useApi();
  const { ordersSummaryData, ordersSummaryDataLoading, ordersOverviewData, ordersOverviewDataLoading } =
    useOrdersOverviewData();

  return (
    <Spinner isLoading={ordersSummaryDataLoading || ordersOverviewDataLoading || false}>
      <div className={"flex flex-col lg:gap-[1.875rem] gap-[0.9375rem] min-h-[38rem]"}>
        <OrdersSummary
          loading={ordersSummaryDataLoading}
          orders={{
            finished: ordersSummaryData?.market?.finishedOrders,
            unfinishedInSlot: ordersSummaryData?.market?.unfinishedInSlotOrders,
            unfinishedOutOfSlot: ordersSummaryData?.market?.unfinishedOutOfSlotOrders,
          }}
        />
        <OrdersTable
          data={[...ordersOverviewData]
            .sort((a, b) => b.createBlockNumber - a.createBlockNumber)
            .map((item, index) => {
              return {
                id: index.toString(),
                lane: item.lane,
                nonce: item.nonce,
                sender: item.sender,
                status: item.status,
                slotIndex:
                  item.slotIndex || item.slotIndex === 0 ? adaptSlotIndex(api, item.slotIndex) : item.slotIndex,
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
