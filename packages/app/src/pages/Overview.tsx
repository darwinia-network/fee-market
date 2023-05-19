import { useMarketOverviewData } from "../hooks";
import { OverviewSummary } from "../components/OverviewSummary";
import OverviewCharts from "../components/OverviewCharts";

const Overview = () => {
  const { averageSpeed, totalOrders, totalRelayers, totalReward, currentFee, ordersCount, feeHistory } =
    useMarketOverviewData();

  return (
    <div className={"flex flex-col lg:gap-[1.875rem] gap-[0.9375rem]"}>
      <OverviewSummary
        averageSpeed={averageSpeed}
        totalOrders={totalOrders}
        totalRelayers={totalRelayers}
        totalReward={totalReward}
        currentFee={currentFee}
      />
      <OverviewCharts
        ordersCount={{ data: ordersCount.data, loading: ordersCount.loading }}
        feeHistory={{ data: feeHistory.data, loading: feeHistory.loading }}
      />
    </div>
  );
};

export default Overview;
