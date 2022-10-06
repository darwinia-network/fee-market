import { useFeeMarket, useApi } from "@feemarket/app-provider";
import { useFeeMarketOverviewData } from "@feemarket/app-hooks";

import OverviewSummary from "../components/OverviewSummary";
import OverviewCharts from "../components/OverviewCharts";

const Overview = () => {
  const { currentMarket, setRefresh } = useFeeMarket();
  const { apiPolkadot } = useApi();
  const { averageSpeed, totalOrders, totalRelayers, totalReward, currentFee, marketOrdersHistory, marketFeeHistory } =
    useFeeMarketOverviewData({
      apiPolkadot,
      currentMarket,
      setRefresh,
    });

  return (
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
  );
};

export default Overview;
