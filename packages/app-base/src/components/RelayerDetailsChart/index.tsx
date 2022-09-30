import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import Chart from "../Chart";

const RelayerDetailsChart = () => {
  const { t } = useTranslation();
  const chartsData = [
    {
      title: t(localeKeys.rewardsOrSlash, { currency: "ring" }),
      timeRange: [t(localeKeys.days, { daysNumber: 7 }), t(localeKeys.days, { daysNumber: 30 }), t(localeKeys.all)],
    },
    {
      title: t(localeKeys.quoteHistory, { currency: "ring" }),
      timeRange: [t(localeKeys.days, { daysNumber: 7 }), t(localeKeys.days, { daysNumber: 30 }), t(localeKeys.all)],
    },
  ];

  const charts = chartsData.map((item, index) => {
    return <Chart key={index} title={item.title} timeRange={item.timeRange} />;
  });

  return (
    <div className={"grid grid-cols-1 lg:grid-cols-2 gap-x-[0.9375rem] gap-y-[0.9375rem] lg:gap-y-[1.875rem]"}>
      {charts}
    </div>
  );
};

export default RelayerDetailsChart;
