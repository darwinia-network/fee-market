import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import finishedIcon from "../../assets/images/finished.svg";
import inProgressIcon from "../../assets/images/in-progress.svg";
import outOfSlotIcon from "../../assets/images/out-of-slot.svg";
import { utils as ethersUtils } from "ethers";
import { useOrderAmount } from "../../hooks";
import { Spinner } from "@darwinia/ui";

const formatOrders = (count: number | null | undefined): string => {
  if (count || count === 0) {
    return ethersUtils.commify(count);
  }
  return "-";
};

const OrdersSummary = () => {
  const { t } = useTranslation();
  const { orderAmount } = useOrderAmount();

  const summaries = [
    { title: t(localeKeys.finished), data: formatOrders(orderAmount.finished), icon: finishedIcon },
    {
      title: `${t(localeKeys.inProgress)} (${t(localeKeys.inSlot)})`,
      data: formatOrders(orderAmount.unfinished.inSlot),
      icon: inProgressIcon,
    },
    {
      title: `${t(localeKeys.inProgress)} (${t(localeKeys.outOfSlot)})`,
      data: formatOrders(orderAmount.unfinished.outOfSlot),
      icon: outOfSlotIcon,
    },
  ];

  return (
    <div
      className={
        "rounded-[0.625rem] bg-blackSecondary p-[0.9375rem] lg:p-[1.875rem] flex flex-col lg:flex-row lg:!gap-[3.75rem]"
      }
    >
      {summaries.map((item, index) => (
        <div
          key={index}
          className={
            "flex lg:flex-col flex-1 shrink-0 justify-between gap-[0.625rem] py-[0.9375rem] first:pt-0 lg:py-0 last:pb-0 border-b lg:border-b-0  border-divider last:border-[rgba(255,255,255,0)] relative lg:after:absolute lg:after:-right-[1.875rem] lg:after:top-[50%] lg:after:-translate-y-1/2 lg:after:h-[2.625rem]  lg:after:w-[1px]  lg:after:bg-divider lg:last:after:bg-[transparent]"
          }
        >
          <div className={"flex flex-1 items-center gap-[0.9375rem] lg:gap-[1.875rem]"}>
            <div className={"w-[1.875rem] h-[1.875rem] lg:w-[3rem] lg:h-[3rem] shrink-0"}>
              <img className={"w-full"} src={item.icon} alt="image" />
            </div>
            <div className={"flex flex-1 items-center lg:items-start lg:flex-col lg:gap-[0.625rem]"}>
              <div className={"flex-1"}>{item.title}</div>
              <Spinner
                isLoading={orderAmount.loading}
                size="small"
                className="text-right lg:text-left flex-1 shrink-0 w-fit"
              >
                <span className="text-primary text-18-bold lg:text-24-bold">{item.data}</span>
              </Spinner>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrdersSummary;
