import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import Chart from "../Chart";

const OverviewCharts = () => {
  const { t } = useTranslation();
  const chartsData = [
    {
      title: t(localeKeys.ordersCount),
      timeRange: [t(localeKeys.days, { daysNumber: 7 }), t(localeKeys.days, { daysNumber: 30 }), t(localeKeys.all)],
    },
    {
      title: t(localeKeys.freeHistory, { currency: "ring" }),
      timeRange: [t(localeKeys.days, { daysNumber: 7 }), t(localeKeys.days, { daysNumber: 30 }), t(localeKeys.all)],
    },
    {
      title: t(localeKeys.ordersCount),
      timeRange: [t(localeKeys.days, { daysNumber: 7 }), t(localeKeys.days, { daysNumber: 30 }), t(localeKeys.all)],
    },
    {
      title: t(localeKeys.freeHistory, { currency: "ring" }),
      timeRange: [t(localeKeys.days, { daysNumber: 7 }), t(localeKeys.days, { daysNumber: 30 }), t(localeKeys.all)],
    },
    {
      title: t(localeKeys.ordersCount),
      timeRange: [t(localeKeys.days, { daysNumber: 7 }), t(localeKeys.days, { daysNumber: 30 }), t(localeKeys.all)],
    },
    {
      title: t(localeKeys.freeHistory, { currency: "ring" }),
      timeRange: [t(localeKeys.days, { daysNumber: 7 }), t(localeKeys.days, { daysNumber: 30 }), t(localeKeys.all)],
    },
    {
      title: t(localeKeys.ordersCount),
      timeRange: [t(localeKeys.days, { daysNumber: 7 }), t(localeKeys.days, { daysNumber: 30 }), t(localeKeys.all)],
    },
    {
      title: t(localeKeys.freeHistory, { currency: "ring" }),
      timeRange: [t(localeKeys.days, { daysNumber: 7 }), t(localeKeys.days, { daysNumber: 30 }), t(localeKeys.all)],
    },
    {
      title: t(localeKeys.ordersCount),
      timeRange: [t(localeKeys.days, { daysNumber: 7 }), t(localeKeys.days, { daysNumber: 30 }), t(localeKeys.all)],
    },
    {
      title: t(localeKeys.freeHistory, { currency: "ring" }),
      timeRange: [t(localeKeys.days, { daysNumber: 7 }), t(localeKeys.days, { daysNumber: 30 }), t(localeKeys.all)],
    },
  ];

  const charts = chartsData.map((item, index) => {
    return <Chart key={index} title={item.title} timeRange={item.timeRange} />;
  });

  return <div className={"grid grid-cols-1 lg:grid-cols-2 gap-[0.9375rem]"}>{charts}</div>;
};

export default OverviewCharts;
