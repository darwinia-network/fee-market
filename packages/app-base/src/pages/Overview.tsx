import OverviewData from "../components/OverviewData";
import OverviewCharts from "../components/OverviewCharts";

const Overview = () => {
  return (
    <>
      <div>
        <OverviewData />
      </div>
      <div className={"mt-[0.9375rem] lg:mt-[1.875rem]"}>
        <OverviewCharts />
      </div>
    </>
  );
};

export default Overview;
