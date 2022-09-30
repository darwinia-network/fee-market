import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";

const OverviewSummary = () => {
  const { t } = useTranslation();
  const summaryData = [
    { title: t(localeKeys.totalRelayers), data: "105 / 105" },
    { title: t(localeKeys.averageSpeed), data: "13s" },
    { title: t(localeKeys.currentMessageFee), data: "25 RING" },
    { title: t(localeKeys.totalRewards), data: "10,440" },
    { title: t(localeKeys.totalOrders), data: "91,588" },
  ];
  const overview = summaryData.map((item, index) => {
    return (
      <div
        key={index}
        className={
          "flex lg:flex-col flex-1 shrink-0 justify-between gap-[0.625rem] py-[0.9375rem] first:pt-0 lg:py-0 last:pb-0 border-b lg:border-b-0  border-divider last:border-[rgba(255,255,255,0)] relative lg:after:absolute lg:after:-right-[1.25rem] lg:after:top-[50%] lg:after:-translate-y-1/2 lg:after:h-[2.625rem]  lg:after:w-[1px]  lg:after:bg-divider lg:last:after:bg-[transparent]"
        }
      >
        <div className={"flex-1"}>{item.title}</div>
        <div className={"text-right lg:text-left flex-1 shrink-0 text-primary text-18-bold lg:text-24-bold"}>
          {item.data}
        </div>
      </div>
    );
  });

  return (
    <div
      className={
        "rounded-[0.625rem] bg-blackSecondary p-[0.9375rem] lg:p-[1.875rem] flex flex-col lg:flex-row lg:!gap-[2.5rem]"
      }
    >
      {overview}
    </div>
  );
};

export default OverviewSummary;
