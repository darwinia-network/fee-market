import OrderDetailsScaffold, { Info } from "../components/OrderDetailsScaffold";
import i18n from "i18next";
import { TFunction, useTranslation } from "react-i18next";
import localeKeys from "../locale/localeKeys";
import { Tooltip, Spinner } from "@darwinia/ui";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useFeeMarket, useApi } from "@feemarket/app-provider";
import { UrlSearchParamsKey, SlotIndex, OrderDetail } from "@feemarket/app-types";
import type {
  OrderEntity,
  SlashEntity,
  RelayerEntity,
  RewardEntity,
  FeeMarketSourceChainEth,
  FeeMarketSourceChainPolkadot,
  OrderStatus,
} from "@feemarket/app-types";
import {
  ORDER_DETAIL_ETH,
  ORDERS_OVERVIEW_POLKADOT,
  DATE_TIME_FORMATE,
  ETH_CHAIN_CONF,
  POLKADOT_CHAIN_CONF,
} from "@feemarket/app-config";
import {
  formatBalance,
  isEthApi,
  isEthChain,
  isPolkadotChain,
  transformEthOrderDetail,
  transformPolkadotOrderDetail,
} from "@feemarket/app-utils";
import { useGrapgQuery, useAccountName } from "@feemarket/app-hooks";
import { formatDistance, format } from "date-fns";
import { capitalize } from "lodash";
import { useLocation } from "react-router-dom";

const ETH_LANE = "eth";

const adaptSlotIndex = (slot: number, api: unknown) => {
  if (isEthApi(api) && slot > 0) {
    return slot - 1;
  }
  return slot;
};

const adaptTime = (time: string): number => {
  if (Number.isNaN(Number(time))) {
    return new Date(`${time}Z`).getTime();
  }
  return new Date(Number(time) * 1000).getTime();
};

const formatNonce = (nonce: string) => {
  if (nonce.startsWith("0x")) {
    return nonce;
  }
  return `#${nonce}`;
};

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
  const { api } = useApi();

  const sourceChain = currentMarket?.source;
  // const destinationChain = currentMarket?.destination;

  const nativeToken = useMemo(
    () =>
      sourceChain
        ? ETH_CHAIN_CONF[sourceChain as FeeMarketSourceChainEth]?.nativeToken ??
          POLKADOT_CHAIN_CONF[sourceChain as FeeMarketSourceChainPolkadot]?.nativeToken ??
          null
        : null,
    [sourceChain]
  );

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(search);
    const lane = urlSearchParams.get(UrlSearchParamsKey.LANE);
    const nonce = urlSearchParams.get(UrlSearchParamsKey.NONCE);
    setLaneAndNonce({ lane, nonce });
  }, [search]);

  const {
    transformedData: ethOrderDetailData,
    loading: ethOrderDetailLoading,
    refetch: updateEthOrderDetail,
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
            | "status"
            | "createBlockTime"
            | "finishBlockTime"
            | "createBlockNumber"
            | "finishBlockNumber"
            | "treasuryAmount"
            | "assignedRelayersAddress"
          > & {
            slashes: (Pick<SlashEntity, "amount" | "relayerRole" | "blockNumber" | "txHash"> & {
              relayer: Pick<RelayerEntity, "address">;
            })[];
            rewards: (Pick<RewardEntity, "amount" | "relayerRole" | "blockNumber" | "txHash"> & {
              relayer: Pick<RelayerEntity, "address">;
            })[];
          })
        | null;
    },
    { orderId: string },
    OrderDetail | null
  >(
    ORDER_DETAIL_ETH,
    {
      variables: { orderId: `${ETH_LANE}-${laneAndNonce.nonce}` },
    },
    transformEthOrderDetail
  );

  const {
    loading: polkadotOrderDetailLoading,
    transformedData: polkadotOrderDetailData,
    refetch: updatePolkadotOrderDetail,
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
    { orderId: string },
    OrderDetail | null
  >(
    ORDERS_OVERVIEW_POLKADOT,
    {
      variables: { orderId: `${currentMarket?.destination}-${laneAndNonce.lane}-${laneAndNonce.nonce}` },
    },
    transformPolkadotOrderDetail
  );

  const orderDetailData = useMemo(() => {
    return ethOrderDetailData ?? polkadotOrderDetailData ?? null;
  }, [ethOrderDetailData, polkadotOrderDetailData]);

  const orderDetailLoading = useMemo(() => {
    return ethOrderDetailLoading ?? polkadotOrderDetailLoading ?? false;
  }, [ethOrderDetailLoading, polkadotOrderDetailLoading]);

  const updateOrderDetail = useCallback(() => {
    updateEthOrderDetail();
    updatePolkadotOrderDetail();
  }, [updateEthOrderDetail, updatePolkadotOrderDetail]);

  useEffect(() => {
    setRefresh(() => () => {
      updateOrderDetail();
    });
  }, [setRefresh, updateOrderDetail]);

  const slots: Slot[] =
    orderDetailData?.slotIndex || orderDetailData?.slotIndex === 0
      ? [
          {
            id: "1",
            relayer: orderDetailData.assignedRelayersAddress[0],
            percentage: adaptSlotIndex(orderDetailData.slotIndex, api) === SlotIndex.SLOT_1 ? 50 : undefined,
          },
          {
            id: "2",
            relayer: orderDetailData.assignedRelayersAddress[1],
            percentage: adaptSlotIndex(orderDetailData.slotIndex, api) === SlotIndex.SLOT_2 ? 50 : undefined,
          },
          {
            id: "3",
            relayer: orderDetailData.assignedRelayersAddress[2],
            percentage: adaptSlotIndex(orderDetailData.slotIndex, api) === SlotIndex.SLOT_3 ? 50 : undefined,
          },
          {
            id: "4",
            isOutOfSlot: true,
            percentage: adaptSlotIndex(orderDetailData.slotIndex, api) === SlotIndex.OUT_OF_SLOT ? 50 : undefined,
          },
        ]
      : [];

  const details: Info[] = [
    {
      id: "1",
      label: t(localeKeys.nonce),
      details: orderDetailData?.nonce ? `${formatNonce(orderDetailData.nonce)}` : "-",
    },
    {
      id: "2",
      label: t(localeKeys.laneId),
      details: orderDetailData?.lane ? `${orderDetailData.lane}` : "-",
    },
    {
      id: "3",
      label: t(localeKeys.timestamp),
      details: orderDetailData?.createBlockTime
        ? `${capitalize(
            formatDistance(adaptTime(orderDetailData.createBlockTime), Date.now(), { addSuffix: true })
          )} (${format(adaptTime(orderDetailData.createBlockTime), DATE_TIME_FORMATE)} +UTC)`
        : "-",
    },
    ...(orderDetailData?.sourceTxHash
      ? [
          {
            id: "4",
            label: t(localeKeys.sourceTxID),
            details: <RenderTxHash hash={orderDetailData.sourceTxHash} />,
          },
        ]
      : []),
    ...(orderDetailData?.sender
      ? [
          {
            id: "5",
            label: t(localeKeys.sender),
            details: (
              <AccountName
                address={orderDetailData.sender}
                className={"text-primary text-12-bold lg:text-14-bold break-words"}
              />
            ),
          },
        ]
      : []),
    {
      id: "6",
      label: t(localeKeys.status),
      details: <RenderOrderStatus status={orderDetailData?.status} />,
    },
    {
      id: "7",
      label: t(localeKeys.fee),
      details:
        orderDetailData?.fee && nativeToken
          ? formatBalance(orderDetailData.fee, nativeToken.decimals, nativeToken.symbol)
          : "-",
    },
    ...(orderDetailData?.createBlockNumber
      ? [
          {
            id: "8",
            label: t(localeKeys.createdAt),
            details: <RenderBlock block={orderDetailData.createBlockNumber} />,
          },
        ]
      : []),
    ...(orderDetailData?.finishBlockNumber
      ? [
          {
            id: "9",
            label: t(localeKeys.confirmAt),
            details: <RenderBlock block={orderDetailData.finishBlockNumber} />,
          },
        ]
      : []),
    {
      id: "10",
      label: t(localeKeys.slotAt),
      details: getSlotsDiagram(slots, t),
    },
  ];

  const rewards: Info[] = orderDetailData?.rewards?.length
    ? [
        {
          id: "1",
          label: t(localeKeys.transaction),
          details: (
            <div className={"text-primary text-12-bold lg:text-14-bold"}>
              {orderDetailData.rewards[0].txHash ??
                (orderDetailData.rewards[0].extrinsicIndex
                  ? `${orderDetailData.rewards[0].blockNumber}-${orderDetailData.rewards[0].extrinsicIndex}`
                  : "-")}
            </div>
          ),
        },
        ...(orderDetailData.rewards
          .filter((item) => item.relayerRole === "Assigned")
          .map((item, index) => ({
            id: `2-${index}`,
            label: t(localeKeys.assignedRelayers),
            details: (
              <div className={"flex flex-col lg:flex-row lg:gap-[0.625rem]"}>
                <AccountName address={item.relayer.address} className={"text-primary text-12-bold lg:text-14-bold"} />
                <div className={"text-12 lg:text-14"}>
                  (+{formatBalance(item.amount, nativeToken?.decimals, nativeToken?.symbol)})
                </div>
              </div>
            ),
          })) || []),
        ...(orderDetailData.rewards
          .filter((item) => item.relayerRole === "Delivery")
          .map((item, index) => ({
            id: `3-${index}`,
            label: t(localeKeys.deliveryRelayer),
            details: (
              <div className={"flex flex-col lg:flex-row lg:gap-[0.625rem]"}>
                <AccountName address={item.relayer.address} className={"text-primary text-12-bold lg:text-14-bold"} />
                <div className={"text-12 lg:text-14"}>
                  (+{formatBalance(item.amount, nativeToken?.decimals, nativeToken?.symbol)})
                </div>
              </div>
            ),
          })) || []),
        ...(orderDetailData.rewards
          .filter((item) => item.relayerRole === "Confirmation")
          .map((item, index) => ({
            id: `4-${index}`,
            label: t(localeKeys.deliveryRelayer),
            details: (
              <div className={"flex flex-col lg:flex-row lg:gap-[0.625rem]"}>
                <AccountName address={item.relayer.address} className={"text-primary text-12-bold lg:text-14-bold"} />
                <div className={"text-12 lg:text-14"}>
                  (+{formatBalance(item.amount, nativeToken?.decimals, nativeToken?.symbol)})
                </div>
              </div>
            ),
          })) || []),
        ...(orderDetailData.treasuryAmount
          ? [
              {
                id: "6",
                label: t(localeKeys.treasury),
                details: `+${formatBalance(
                  orderDetailData.treasuryAmount,
                  nativeToken?.decimals,
                  nativeToken?.symbol
                )}`,
              },
            ]
          : []),
      ]
    : [];

  const slash: Info[] = orderDetailData?.slashes?.length
    ? [
        {
          id: "1",
          label: t(localeKeys.transaction),
          details: (
            <div className={"text-primary text-12-bold lg:text-14-bold"}>
              {orderDetailData.slashes[0].txHash ??
                (orderDetailData.slashes[0].extrinsicIndex
                  ? `${orderDetailData.slashes[0].blockNumber}-${orderDetailData.slashes[0].extrinsicIndex}`
                  : "-")}
            </div>
          ),
        },
        ...(orderDetailData.slashes.map((item, index) => ({
          id: `2-${index}`,
          label: t(localeKeys.assignedRelayers),
          details: (
            <div className={"flex flex-col lg:flex-row lg:gap-[0.625rem]"}>
              <AccountName address={item.relayer.address} className={"text-primary text-12-bold lg:text-14-bold"} />
              <div className={"text-12 lg:text-14"}>
                (-{formatBalance(item.amount, nativeToken?.decimals, nativeToken?.symbol)})
              </div>
            </div>
          ),
        })) || []),
      ]
    : [];

  return (
    <Spinner isLoading={orderDetailLoading}>
      <div className={"flex flex-col gap-[0.9375rem] lg:gap-[1.875rem]"}>
        <OrderDetailsScaffold title={t(localeKeys.details)} data={details} />
        <OrderDetailsScaffold title={t(localeKeys.reward)} data={rewards} />
        <OrderDetailsScaffold title={t(localeKeys.slash)} data={slash} />
      </div>
    </Spinner>
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
                  {slot.relayer && <AccountName address={slot.relayer} className={"text-primary"} />}
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
                        {slot.relayer ? (
                          <AccountName address={slot.relayer} className={"text-12-bold text-primary"} />
                        ) : (
                          "-"
                        )}
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

const RenderTxHash = ({ hash }: { hash: string }) => {
  const { currentMarket } = useFeeMarket();

  const sourceChain = currentMarket?.source;
  const sub = "tx/";
  const chainConfig = isEthChain(sourceChain)
    ? ETH_CHAIN_CONF[sourceChain]
    : isPolkadotChain(sourceChain)
    ? POLKADOT_CHAIN_CONF[sourceChain]
    : null;

  return (
    <a
      className={`hover:opacity-80 text-primary text-12-bold lg:text-14-bold break-words`}
      rel="noopener noreferrer"
      target={"_blank"}
      href={sub && chainConfig ? `${chainConfig.explorer.url}${sub}${hash}` : "#"}
    >
      {hash}
    </a>
  );
};

const RenderBlock = ({ block }: { block: number }) => {
  const { currentMarket } = useFeeMarket();

  const sourceChain = currentMarket?.source;
  const sub = "block/";
  const chainConfig = isEthChain(sourceChain)
    ? ETH_CHAIN_CONF[sourceChain]
    : isPolkadotChain(sourceChain)
    ? POLKADOT_CHAIN_CONF[sourceChain]
    : null;

  return (
    <a
      className={`hover:opacity-80 text-primary text-12-bold lg:text-14-bold`}
      rel="noopener noreferrer"
      target={"_blank"}
      href={sub && chainConfig ? `${chainConfig.explorer.url}${sub}${block}` : "#"}
    >{`Block #${block}`}</a>
  );
};

const AccountName = ({ address, className }: { address: string; className?: string }) => {
  const { currentMarket } = useFeeMarket();
  const { api } = useApi();
  const { displayName } = useAccountName(api, address);

  const sourceChain = currentMarket?.source;
  const sub = isEthChain(sourceChain) ? "address/" : isPolkadotChain(sourceChain) ? "account/" : null;
  const chainConfig = isEthChain(sourceChain)
    ? ETH_CHAIN_CONF[sourceChain]
    : isPolkadotChain(sourceChain)
    ? POLKADOT_CHAIN_CONF[sourceChain]
    : null;

  return (
    <a
      className={`hover:opacity-80 ${className}`}
      rel="noopener noreferrer"
      target={"_blank"}
      href={sub && chainConfig ? `${chainConfig.explorer.url}${sub}${address}` : "#"}
    >
      {displayName}
    </a>
  );
};

export default OrderDetails;
