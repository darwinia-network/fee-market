import OrderDetailsScaffold, { Info } from "../components/OrderDetailsScaffold";
import i18n from "i18next";
import { TFunction, useTranslation } from "react-i18next";
import localeKeys from "../locale/localeKeys";
import { Tooltip } from "@darwinia/ui";

import { useEffect, useState } from "react";
import { useFeeMarket } from "@feemarket/app-provider";
import { UrlSearchParamsKey, SlotIndex } from "@feemarket/app-types";
import type {
  OrderEntity,
  SlashEntity,
  RelayerEntity,
  RewardEntity,
  FeeMarketSourceChainEth,
  FeeMarketSourceChainPolkadot,
  OrderStatus,
} from "@feemarket/app-types";
import { ORDER_DETAIL, DATE_TIME_FORMATE, ETH_CHAIN_CONF, POLKADOT_CHAIN_CONF } from "@feemarket/app-config";
import {} from "@feemarket/app-utils";
import { useGrapgQuery } from "@feemarket/app-hooks";
import { formatDistance, format } from "date-fns";
import { capitalize } from "lodash";
import { utils as ethersUtils } from "ethers";
import { useLocation } from "react-router-dom";

const formatStatus = (status: OrderStatus): string => {
  switch (status) {
    case "Finished":
      return i18n.t(localeKeys.finished);
    case "InProgress":
      return i18n.t(localeKeys.inProgress);
    default:
      return "-";
  }
};

const RenderOrderStatus = ({ status }: { status: OrderStatus | null | undefined }) => {
  if (!status) {
    return <span>-</span>;
  }

  const bg = status === "Finished" ? "bg-success" : "bg-warning";

  return (
    <div className={"flex gap-[0.525rem] items-center"}>
      <div className={`w-[0.5rem] h-[0.5rem] rounded-full ${bg}`} />
      <div>{formatStatus(status)}</div>
    </div>
  );
};

const formatBalance = (
  amount: string | null | undefined,
  symbol: string | null | undefined,
  decimals: number | null | undefined
): string => {
  if (amount && symbol && decimals) {
    return `${ethersUtils.commify(ethersUtils.formatUnits(amount, decimals))} ${symbol}`;
  }
  return "-";
};

interface Slot {
  id: string;
  relayer?: string;
  isOutOfSlot?: boolean;
  percentage?: number;
}

const OrderDetails = () => {
  const { t } = useTranslation();
  const { search } = useLocation();
  const [laneAndNonce, setLaneAndNonce] = useState<{ lane: string | null; nonce: string | null }>({
    lane: null,
    nonce: null,
  });
  const { currentMarket, setRefresh } = useFeeMarket();

  const nativeToken = currentMarket?.source
    ? ETH_CHAIN_CONF[currentMarket.source as FeeMarketSourceChainEth]?.nativeToken ??
      POLKADOT_CHAIN_CONF[currentMarket.source as FeeMarketSourceChainPolkadot]?.nativeToken ??
      null
    : null;

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(search);
    const lane = urlSearchParams.get(UrlSearchParamsKey.LANE);
    const nonce = urlSearchParams.get(UrlSearchParamsKey.NONCE);
    setLaneAndNonce({ lane, nonce });
  }, [search]);

  const {
    // loading: orderDetailLoading,
    data: orderDetailData,
    refetch: updateOrderDetail,
  } = useGrapgQuery<
    {
      order:
        | (Pick<
            OrderEntity,
            | "lane"
            | "nonce"
            | "fee"
            | "sender"
            | "sourceTxHash"
            | "slotIndex"
            | "slotTime"
            | "outOfSlotBlock"
            | "status"
            | "createBlockTime"
            | "finishBlockTime"
            | "createBlockNumber"
            | "finishBlockNumber"
            | "treasuryAmount"
            | "assignedRelayersAddress"
          > & {
            slashes: {
              nodes: (Pick<SlashEntity, "amount" | "relayerRole" | "blockNumber" | "extrinsicIndex"> & {
                relayer: Pick<RelayerEntity, "address">;
              })[];
            } | null;
            rewards: {
              nodes: (Pick<RewardEntity, "amount" | "relayerRole" | "blockNumber" | "extrinsicIndex"> & {
                relayer: Pick<RelayerEntity, "address">;
              })[];
            } | null;
          })
        | null;
    },
    { orderId: string }
  >(ORDER_DETAIL, {
    variables: { orderId: `${currentMarket?.destination}-${laneAndNonce.lane}-${laneAndNonce.nonce}` },
  });

  useEffect(() => {
    setRefresh(() => () => {
      updateOrderDetail();
    });
  }, [setRefresh, updateOrderDetail]);

  const slots: Slot[] =
    orderDetailData?.order?.slotIndex || orderDetailData?.order?.slotIndex === 0
      ? [
          {
            id: "1",
            relayer: orderDetailData.order.assignedRelayersAddress[0],
            percentage: orderDetailData.order.slotIndex === SlotIndex.SLOT_1 ? 50 : undefined,
          },
          {
            id: "2",
            relayer: orderDetailData.order.assignedRelayersAddress[1],
            percentage: orderDetailData.order.slotIndex === SlotIndex.SLOT_2 ? 50 : undefined,
          },
          {
            id: "3",
            relayer: orderDetailData.order.assignedRelayersAddress[2],
            percentage: orderDetailData.order.slotIndex === SlotIndex.SLOT_3 ? 50 : undefined,
          },
          {
            id: "4",
            isOutOfSlot: true,
            percentage: orderDetailData.order.slotIndex === SlotIndex.OUT_OF_SLOT ? 50 : undefined,
          },
        ]
      : [];

  const details: Info[] = [
    {
      id: "1",
      label: t(localeKeys.nonce),
      details: orderDetailData?.order?.nonce ? `#${orderDetailData.order.nonce}` : "-",
    },
    {
      id: "2",
      label: t(localeKeys.laneId),
      details: orderDetailData?.order?.nonce ? `${orderDetailData.order.lane}` : "-",
    },
    {
      id: "3",
      label: t(localeKeys.timestamp),
      details: orderDetailData?.order?.createBlockTime
        ? `${capitalize(
            formatDistance(new Date(`${orderDetailData.order.createBlockTime}Z`), Date.now(), { addSuffix: true })
          )} (${format(new Date(`${orderDetailData.order.createBlockTime}Z`), DATE_TIME_FORMATE)} +UTC)`
        : "-",
    },
    {
      id: "4",
      label: t(localeKeys.sourceTxID),
      details: (
        <div className={"text-primary text-12-bold lg:text-14-bold break-words"}>
          {orderDetailData?.order?.sourceTxHash || "-"}
        </div>
      ),
    },
    {
      id: "5",
      label: t(localeKeys.sender),
      details: (
        <div className={"text-primary text-12-bold lg:text-14-bold break-words"}>
          {orderDetailData?.order?.sender || "-"}
        </div>
      ),
    },
    {
      id: "6",
      label: t(localeKeys.status),
      details: <RenderOrderStatus status={orderDetailData?.order?.status} />,
    },
    {
      id: "7",
      label: t(localeKeys.fee),
      details:
        orderDetailData?.order?.fee && nativeToken
          ? `${ethersUtils.commify(ethersUtils.formatUnits(orderDetailData.order.fee, nativeToken.decimals))} ${
              nativeToken.symbol
            }`
          : "-",
    },
    {
      id: "8",
      label: t(localeKeys.createdAt),
      details: (
        <div className={"text-primary text-12-bold lg:text-14-bold"}>
          {orderDetailData?.order?.createBlockNumber ? `Block #${orderDetailData.order.createBlockNumber}` : "-"}
        </div>
      ),
    },
    {
      id: "9",
      label: t(localeKeys.confirmAt),
      details: (
        <div className={"text-primary text-12-bold lg:text-14-bold"}>
          {orderDetailData?.order?.finishBlockNumber ? `Block #${orderDetailData.order.finishBlockNumber}` : "-"}
        </div>
      ),
    },
    {
      id: "10",
      label: t(localeKeys.slotAt),
      details: getSlotsDiagram(slots, t),
    },
  ];

  const rewards: Info[] = orderDetailData?.order?.rewards?.nodes.length
    ? [
        {
          id: "1",
          label: t(localeKeys.extrinsic),
          details: (
            <div className={"text-primary text-12-bold lg:text-14-bold"}>
              {orderDetailData.order.rewards.nodes[0].extrinsicIndex
                ? `${orderDetailData.order.rewards.nodes[0].blockNumber}-${orderDetailData.order.rewards.nodes[0].extrinsicIndex}`
                : "-"}
            </div>
          ),
        },
        ...(orderDetailData.order.rewards.nodes
          .filter((item) => item.relayerRole === "Assigned")
          .map((item, index) => ({
            id: `2-${index}`,
            label: t(localeKeys.assignedRelayers),
            details: (
              <div className={"flex flex-col lg:flex-row lg:gap-[0.625rem]"}>
                <div className={"text-primary text-12-bold lg:text-14-bold"}>{item.relayer.address}</div>
                <div className={"text-12 lg:text-14"}>
                  (+{formatBalance(item.amount, nativeToken?.symbol, nativeToken?.decimals)})
                </div>
              </div>
            ),
          })) || []),
        ...(orderDetailData.order.rewards.nodes
          .filter((item) => item.relayerRole === "Delivery")
          .map((item, index) => ({
            id: `3-${index}`,
            label: t(localeKeys.deliveryRelayer),
            details: (
              <div className={"flex flex-col lg:flex-row lg:gap-[0.625rem]"}>
                <div className={"text-primary text-12-bold lg:text-14-bold"}>{item.relayer.address}</div>
                <div className={"text-12 lg:text-14"}>
                  (+{formatBalance(item.amount, nativeToken?.symbol, nativeToken?.decimals)})
                </div>
              </div>
            ),
          })) || []),
        ...(orderDetailData.order.rewards.nodes
          .filter((item) => item.relayerRole === "Confirmation")
          .map((item, index) => ({
            id: `4-${index}`,
            label: t(localeKeys.deliveryRelayer),
            details: (
              <div className={"flex flex-col lg:flex-row lg:gap-[0.625rem]"}>
                <div className={"text-primary text-12-bold lg:text-14-bold"}>{item.relayer.address}</div>
                <div className={"text-12 lg:text-14"}>
                  (+{formatBalance(item.amount, nativeToken?.symbol, nativeToken?.decimals)})
                </div>
              </div>
            ),
          })) || []),
        ...(orderDetailData.order.treasuryAmount
          ? [
              {
                id: "6",
                label: t(localeKeys.treasury),
                details: `+${formatBalance(
                  orderDetailData.order.treasuryAmount,
                  nativeToken?.symbol,
                  nativeToken?.decimals
                )}`,
              },
            ]
          : []),
      ]
    : [];

  const slash: Info[] = orderDetailData?.order?.slashes?.nodes.length
    ? [
        {
          id: "1",
          label: t(localeKeys.extrinsic),
          details: (
            <div className={"text-primary text-12-bold lg:text-14-bold"}>
              {orderDetailData.order.slashes.nodes[0].extrinsicIndex
                ? `${orderDetailData.order.slashes.nodes[0].blockNumber}-${orderDetailData.order.slashes.nodes[0].extrinsicIndex}`
                : "-"}
            </div>
          ),
        },
        ...(orderDetailData.order.slashes.nodes.map((item, index) => ({
          id: `2-${index}`,
          label: t(localeKeys.assignedRelayers),
          details: (
            <div className={"flex flex-col lg:flex-row lg:gap-[0.625rem]"}>
              <div className={"text-primary text-12-bold lg:text-14-bold"}>{item.relayer.address}</div>
              <div className={"text-12 lg:text-14"}>
                (-{formatBalance(item.amount, nativeToken?.symbol, nativeToken?.decimals)})
              </div>
            </div>
          ),
        })) || []),
      ]
    : [];

  return (
    <div className={"flex flex-col gap-[0.9375rem] lg:gap-[1.875rem]"}>
      <OrderDetailsScaffold title={t(localeKeys.details)} data={details} />
      <OrderDetailsScaffold title={t(localeKeys.reward)} data={rewards} />
      <OrderDetailsScaffold title={t(localeKeys.slash)} data={slash} />
    </div>
  );
};

const getSlotsDiagram = (slots: Slot[], t: TFunction<"translation">) => {
  if (slots.length === 0) {
    return "-";
  }

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
                className={`hidden justify-center w-[8.25rem] py-[0.3125rem] relative lg:flex ${pcBorderClass} ${pcRoundClass}`}
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
