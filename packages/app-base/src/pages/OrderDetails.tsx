import OrderDetailsScaffold, { Info } from "../components/OrderDetailsScaffold";
import { TFunction, useTranslation } from "react-i18next";
import localeKeys from "../locale/localeKeys";
import { createStatusLabel } from "../components/OrdersTable";
import { Tooltip } from "@darwinia/ui";

interface Slot {
  id: string;
  relayer?: string;
  isOutOfSlot?: boolean;
  percentage?: number;
}

const OrderDetails = () => {
  const { t } = useTranslation();

  const slots: Slot[] = [
    {
      id: "1",
      relayer: "5L4hrfj....yUpnnh",
    },
    {
      id: "2",
      relayer: "5L4hrfj....yUpnnh",
    },
    {
      id: "3",
      relayer: "5L4hrfj....yUpnnh",
      percentage: 80,
    },
    {
      id: "4",
      isOutOfSlot: true,
    },
  ];

  const details: Info[] = [
    {
      id: "1",
      label: t(localeKeys.nonce),
      details: "#126",
    },
    {
      id: "2",
      label: t(localeKeys.laneId),
      details: "0xcb515340b4",
    },
    {
      id: "3",
      label: t(localeKeys.timestamp),
      details: "1 hrs 23 mins ago (2022/8/16 09:23:14 AM +UTC)",
    },
    {
      id: "4",
      label: t(localeKeys.sourceTxID),
      details: (
        <div className={"text-primary text-12-bold lg:text-14-bold break-words"}>
          0x433dd33c63a3f8a4a7f7483fe33b15a7963665d33c1ee60ba70075290d43cc87
        </div>
      ),
    },
    {
      id: "5",
      label: t(localeKeys.sender),
      details: (
        <div className={"text-primary text-12-bold lg:text-14-bold break-words"}>
          5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM
        </div>
      ),
    },
    {
      id: "6",
      label: t(localeKeys.state),
      details: createStatusLabel("finished", t),
    },
    {
      id: "7",
      label: t(localeKeys.fee),
      details: "179.999 CRAB",
    },
    {
      id: "8",
      label: t(localeKeys.createdAt),
      details: <div className={"text-primary text-12-bold lg:text-14-bold"}>Block #234</div>,
    },
    {
      id: "9",
      label: t(localeKeys.confirmAt),
      details: <div className={"text-primary text-12-bold lg:text-14-bold"}>Block #234</div>,
    },
    {
      id: "10",
      label: t(localeKeys.slotAt),
      details: getSlotsDiagram(slots, t),
    },
  ];

  const rewards: Info[] = [
    {
      id: "1",
      label: t(localeKeys.extrinsic),
      details: <div className={"text-primary text-12-bold lg:text-14-bold"}>11439282-1</div>,
    },
    {
      id: "2",
      label: t(localeKeys.assignedRelayers),
      details: (
        <div className={"flex flex-col lg:flex-row lg:gap-[0.625rem]"}>
          <div className={"text-primary text-12-bold lg:text-14-bold"}>5L4hrf...uyUpnM</div>
          <div className={"text-12 lg:text-14"}>(+11,999 CRAB)</div>
        </div>
      ),
    },
    {
      id: "3",
      label: t(localeKeys.deliveryRelayer),
      details: (
        <div className={"flex flex-col lg:flex-row lg:gap-[0.625rem]"}>
          <div className={"text-primary text-12-bold lg:text-14-bold"}>5L4hrf...uyUpnM</div>
          <div className={"text-12 lg:text-14"}>(+20 CRAB)</div>
        </div>
      ),
    },
    {
      id: "4",
      label: t(localeKeys.confirmationRelayer),
      details: (
        <div className={"flex flex-col lg:flex-row lg:gap-[0.625rem]"}>
          <div className={"text-primary text-12-bold lg:text-14-bold"}>5L4hrf...uyUpnM</div>
          <div className={"text-12 lg:text-14"}>(+220 CRAB)</div>
        </div>
      ),
    },
    {
      id: "6",
      label: t(localeKeys.treasury),
      details: "+180 CRAB",
    },
  ];

  const slash: Info[] = [
    {
      id: "1",
      label: t(localeKeys.extrinsic),
      details: <div className={"text-primary text-12-bold lg:text-14-bold"}>11439282-1</div>,
    },
    {
      id: "2",
      label: t(localeKeys.assignedRelayers),
      details: (
        <div className={"flex flex-col lg:flex-row lg:gap-[0.625rem]"}>
          <div className={"text-primary text-12-bold lg:text-14-bold"}>5L4hrf...uyUpnM</div>
          <div className={"text-12 lg:text-14"}>(+11,999 CRAB)</div>
        </div>
      ),
    },
    {
      id: "3",
      label: t(localeKeys.deliveryRelayer),
      details: (
        <div className={"flex flex-col lg:flex-row lg:gap-[0.625rem]"}>
          <div className={"text-primary text-12-bold lg:text-14-bold"}>5L4hrf...uyUpnM</div>
          <div className={"text-12 lg:text-14"}>(+20 CRAB)</div>
        </div>
      ),
    },
    {
      id: "4",
      label: t(localeKeys.confirmationRelayer),
      details: (
        <div className={"flex flex-col lg:flex-row lg:gap-[0.625rem]"}>
          <div className={"text-primary text-12-bold lg:text-14-bold"}>5L4hrf...uyUpnM</div>
          <div className={"text-12 lg:text-14"}>(+220 CRAB)</div>
        </div>
      ),
    },
  ];

  return (
    <div className={"flex flex-col gap-[0.9375rem] lg:gap-[1.875rem]"}>
      <OrderDetailsScaffold title={t(localeKeys.details)} data={details} />
      <OrderDetailsScaffold title={t(localeKeys.reward)} data={rewards} />
      <OrderDetailsScaffold title={t(localeKeys.slash)} data={slash} />
    </div>
  );
};

const getSlotsDiagram = (slots: Slot[], t: TFunction<"translation">) => {
  return (
    <div>
      <div className={"flex flex-col lg:flex-row lg:h-[2.9375rem] lg:items-end"}>
        {slots.map((slot, index) => {
          const mobileRoundClass =
            index === 0
              ? "rounded-tl-[0.3125rem] rounded-tr-[0.3125rem]"
              : index === slots.length - 1
              ? "rounded-bl-[0.3125rem] rounded-br-[0.3125rem]"
              : "";

          const pcRoundClass =
            index === 0
              ? "rounded-bl-[0.625rem] rounded-tl-[0.625rem]"
              : index === slots.length - 1
              ? "rounded-tr-[0.625rem] rounded-br-[0.625rem]"
              : "";

          const mobileBorderClass =
            index === slots.length - 1
              ? "border border-halfPrimary border-t-0"
              : index === slots.length - 2
              ? "border border-primary"
              : "border border-b-0 border-primary";

          const pcBorderClass =
            index === slots.length - 1
              ? "border-2 border-halfPrimary border-l-0"
              : index === slots.length - 2
              ? "border-2 border-primary"
              : "border-2 border-r-0 border-primary";

          const showProgressBall = typeof slot.percentage !== "undefined";
          const mobileSlotHeight = 74;
          const mobileBallSize = 6;
          const mobileBorderSize = 0; // both sides
          const progressZone = mobileSlotHeight - mobileBallSize - mobileBallSize / 2 - mobileBorderSize;
          const mobileBallPosition = showProgressBall ? ((slot.percentage ?? 0) * progressZone) / 100 : 0;

          return (
            <div key={slot.id}>
              {/*Mobile slot diagram*/}
              <div className={`flex lg:hidden items-center gap-[0.625rem]`}>
                <div className={`relative w-[0.625rem] h-[4.625rem] ${mobileBorderClass} ${mobileRoundClass}`}>
                  {showProgressBall && (
                    <div
                      style={{ top: `${mobileBallPosition}px` }}
                      className={
                        "absolute top-0 left-[50%] -translate-x-1/2 w-[0.375rem] h-[0.375rem] bg-white rounded-full"
                      }
                    />
                  )}
                </div>
                <div className={"text-12-bold"}>
                  <div>
                    {slot.isOutOfSlot ? t(localeKeys.outOfSlot) : t(localeKeys.slotNumber, { slotNumber: index + 1 })}
                  </div>
                  <div className={"text-primary"}>{slot.relayer}</div>
                </div>
              </div>
              {/*PC slot diagram*/}
              <div
                className={`hidden relative justify-center w-[8.25rem] py-[0.3125rem] relative lg:flex ${pcBorderClass} ${pcRoundClass}`}
              >
                {showProgressBall && (
                  <Tooltip
                    extendTriggerToPopover={true}
                    offset={[0, -14]}
                    toolTipClassName={"border-2 !rounded-[0.3125rem]"}
                    message={
                      <div className={"flex items-center gap-[0.625rem]"}>
                        <div className={"text-10"}>{t(localeKeys.assignedRelayers)}:</div>
                        <div className={"text-12-bold text-primary"}>{slot.relayer}</div>
                      </div>
                    }
                    className={"cursor-default absolute h-[1.75rem] w-[2px] bg-white -top-[1.9075rem]"}
                  >
                    <div
                      className={"absolute w-[0.875rem] h-[0.875rem] bg-primary -left-[0.375rem] top-0 rounded-full"}
                    />
                  </Tooltip>
                )}
                <div className={`self-center text-12-bold ${slot.isOutOfSlot ? "text-halfWhite" : ""}`}>
                  {slot.isOutOfSlot ? t(localeKeys.outOfSlot) : t(localeKeys.slotNumber, { slotNumber: index + 1 })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderDetails;
