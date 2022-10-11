import { useFeeMarket } from "@feemarket/app-provider";
import { useOrdersData } from "@feemarket/app-hooks";

import OrdersSummary from "../components/OrdersSummary";
import OrdersTable from "../components/OrdersTable";
import { DateRangePicker } from "@darwinia/ui";
import { useState } from "react";

const Orders = () => {
  const { currentMarket, setRefresh } = useFeeMarket();

  const [startDate, setStartDate] = useState<Date | string>();
  const [endDate, setEndDate] = useState<Date | string>();

  const { ordersSummaryData, ordersSummaryLoading, ordersTableData, ordersTableLoading } = useOrdersData({
    currentMarket,
    setRefresh,
  });

  return (
    <div className={"flex flex-col lg:gap-[1.875rem] gap-[0.9375rem]"}>
      <OrdersSummary
        loading={ordersSummaryLoading}
        orders={{
          finished: ordersSummaryData?.market?.finishedOrders,
          unfinishedInSlot: ordersSummaryData?.market?.unfinishedInSlotOrders,
          unfinishedOutOfSlot: ordersSummaryData?.market?.unfinishedOutOfSlotOrders,
        }}
      />
      <OrdersTable ordersTableLoading={ordersTableLoading} ordersTableData={[]} />
    </div>
  );
};

export default Orders;
