import OverviewSummary from "../components/OverviewSummary";
import OverviewCharts from "../components/OverviewCharts";

const Overview = () => {
  return (
    <div className={"flex flex-col lg:gap-[1.875rem] gap-[0.9375rem]"}>
      <OverviewSummary />
      <OverviewCharts />
    </div>
  );
};

export default Overview;
