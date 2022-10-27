import { useFeeMarket, useApi } from "@feemarket/app-provider";
import { useFeeMarketOverviewData } from "@feemarket/app-hooks";
import { Spinner } from "@darwinia/ui";
import OverviewSummary from "../components/OverviewSummary";
import OverviewCharts from "../components/OverviewCharts";
import { useMemo } from "react";

const Overview = () => {
  const { currentMarket, setRefresh } = useFeeMarket();
  const { providerApi: api } = useApi();
  const {
    averageSpeed,
    totalOrders,
    totalRelayers,
    totalReward,
    currentFee,
    marketOrdersHistory,
    marketFeeHistoryLoading,
    marketFeeHistory,
    marketOrdersHistoryLoading,
  } = useFeeMarketOverviewData({
    api,
    currentMarket,
    setRefresh,
  });

  const loading = useMemo(() => {
    return (
      averageSpeed.loading ||
      totalOrders.loading ||
      totalRelayers.loading ||
      totalReward.loading ||
      currentFee.loading ||
      marketFeeHistoryLoading ||
      marketOrdersHistoryLoading ||
      false
    );
  }, [
    averageSpeed.loading,
    totalOrders.loading,
    totalRelayers.loading,
    totalReward.loading,
    currentFee.loading,
    marketFeeHistoryLoading,
    marketOrdersHistoryLoading,
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
          ordersCountData={marketOrdersHistory || []}
          feeHistoryData={marketFeeHistory || []}
        />
      </div>
    </Spinner>
  );
};

export default Overview;
