import { useMarketOverviewData } from "@feemarket/hooks";
import { useMarket } from "@feemarket/market";
import { Spinner } from "@darwinia/ui";
import OverviewSummary from "../components/OverviewSummary";
import OverviewCharts from "../components/OverviewCharts";
import { useMemo } from "react";

const Overview = () => {
  const { currentMarket } = useMarket();

  const {
    averageSpeed,
    totalOrders,
    totalRelayers,
    totalReward,
    currentFee,
    ordersCountData,
    feeHistoryDataLoading,
    feeHistoryData,
    ordersCountDataLoading,
  } = useMarketOverviewData();

  const loading = useMemo(() => {
    return (
      averageSpeed.loading ||
      totalOrders.loading ||
      totalRelayers.loading ||
      totalReward.loading ||
      currentFee.loading ||
      feeHistoryDataLoading ||
      ordersCountDataLoading ||
      false
    );
  }, [
    averageSpeed.loading,
    totalOrders.loading,
    totalRelayers.loading,
    totalReward.loading,
    currentFee.loading,
    feeHistoryDataLoading,
    ordersCountDataLoading,
  ]);

  return (
    <Spinner isLoading={loading}>
      <div className={"flex flex-col lg:gap-[1.875rem] gap-[0.9375rem]"}>
        <OverviewSummary
          currentMarket={currentMarket}
          averageSpeed={averageSpeed}
          totalOrders={totalOrders}
          totalRelayers={totalRelayers}
          totalReward={totalReward}
          currentFee={currentFee}
        />
        <OverviewCharts
          currentMarket={currentMarket}
          ordersCountData={ordersCountData || []}
          feeHistoryEthData={feeHistoryData || []}
        />
      </div>
    </Spinner>
  );
};

export default Overview;
