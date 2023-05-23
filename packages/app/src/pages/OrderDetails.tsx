import OrderDetailsScaffold, { Info } from "../components/OrderDetailsScaffold";
import i18n from "i18next";
import { TFunction, useTranslation } from "react-i18next";
import localeKeys from "../locale/localeKeys";
import { Tooltip, Spinner } from "@darwinia/ui";
import { useEffect, useMemo, useState } from "react";
import { useMarket, useOrderDetail } from "../hooks";
import { SlotIndex, OrderStatus, UrlSearchParamsKey } from "../types";
import {
  formatBalance,
  isEthChain,
  isPolkadotChain,
  unifyTime,
  formatTime,
  formatUrlChainName,
  formatOrderId,
  getEthChainConfig,
  getPolkadotChainConfig,
  adaptSlotIndex,
} from "../utils";
import { useAccountName } from "../hooks";
import { formatDistance } from "date-fns";
import { capitalize } from "lodash";
import { NavLink, useLocation } from "react-router-dom";

const ETH_BALANCE_DECIMALS = 8;

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
  const [laneNonce, setLaneNonce] = useState<{ lane: string | null; nonce: string | null }>({
    lane: null,
    nonce: null,
  });
  const { sourceChain } = useMarket();
  const { orderDetail } = useOrderDetail(laneNonce.lane, laneNonce.nonce);

  const nativeToken = useMemo(() => {
    if (isEthChain(sourceChain)) {
      return getEthChainConfig(sourceChain).nativeToken;
    } else if (isPolkadotChain(sourceChain)) {
      return getPolkadotChainConfig(sourceChain).nativeToken;
    }
    return null;
  }, [sourceChain]);

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(search);
    const lane = urlSearchParams.get(UrlSearchParamsKey.LANE);
    const nonce = urlSearchParams.get(UrlSearchParamsKey.NONCE);
    setLaneNonce({ lane, nonce });
  }, [search]);

  const slots: Slot[] =
    orderDetail.value?.slotIndex || orderDetail.value?.slotIndex === 0
      ? [
          {
            id: "1",
            relayer: orderDetail.value.assignedRelayersAddress[0],
            percentage: adaptSlotIndex(sourceChain, orderDetail.value.slotIndex) === SlotIndex.SLOT_1 ? 50 : undefined,
          },
          {
            id: "2",
            relayer: orderDetail.value.assignedRelayersAddress[1],
            percentage: adaptSlotIndex(sourceChain, orderDetail.value.slotIndex) === SlotIndex.SLOT_2 ? 50 : undefined,
          },
          {
            id: "3",
            relayer: orderDetail.value.assignedRelayersAddress[2],
            percentage: adaptSlotIndex(sourceChain, orderDetail.value.slotIndex) === SlotIndex.SLOT_3 ? 50 : undefined,
          },
          {
            id: "4",
            isOutOfSlot: true,
            percentage:
              adaptSlotIndex(sourceChain, orderDetail.value.slotIndex) === SlotIndex.OUT_OF_SLOT ? 50 : undefined,
          },
        ]
      : [];

  const details: Info[] = [
    {
      id: "1",
      label: t(localeKeys.nonce),
      details: orderDetail.value?.nonce ? `${formatOrderId(orderDetail.value.nonce)}` : "-",
    },
    {
      id: "2",
      label: t(localeKeys.laneId),
      details: orderDetail.value?.lane ? `${orderDetail.value.lane}` : "-",
    },
    {
      id: "3",
      label: t(localeKeys.timestamp),
      details: orderDetail.value?.createBlockTime
        ? `${capitalize(
            formatDistance(unifyTime(orderDetail.value.createBlockTime), Date.now(), { addSuffix: true })
          )} (${formatTime(unifyTime(orderDetail.value.createBlockTime))} +UTC)`
        : "-",
    },
    ...(orderDetail.value?.sourceTxHash
      ? [
          {
            id: "4",
            label: t(localeKeys.sourceTxID),
            details: <RenderTxHash hash={orderDetail.value.sourceTxHash} />,
          },
        ]
      : []),
    ...(orderDetail.value?.sender
      ? [
          {
            id: "5",
            label: t(localeKeys.sender),
            details: (
              <AccountAddress
                address={orderDetail.value.sender}
                className={"text-primary text-12-bold lg:text-14-bold break-words"}
              />
            ),
          },
        ]
      : []),
    {
      id: "6",
      label: t(localeKeys.status),
      details: <RenderOrderStatus status={orderDetail.value?.status} />,
    },
    {
      id: "7",
      label: t(localeKeys.fee),
      details:
        orderDetail.value?.fee && nativeToken
          ? formatBalance(orderDetail.value.fee, nativeToken.decimals, nativeToken.symbol, {
              decimals: isEthChain(sourceChain) ? ETH_BALANCE_DECIMALS : undefined,
            })
          : "-",
    },
    ...(orderDetail.value?.createBlockNumber
      ? [
          {
            id: "8",
            label: t(localeKeys.createdAt),
            details: <RenderBlock block={orderDetail.value.createBlockNumber} />,
          },
        ]
      : []),
    ...(orderDetail.value?.finishBlockNumber
      ? [
          {
            id: "9",
            label: t(localeKeys.confirmAt),
            details: <RenderBlock block={orderDetail.value.finishBlockNumber} />,
          },
        ]
      : []),
    {
      id: "10",
      label: t(localeKeys.slotAt),
      details: getSlotsDiagram(slots, t),
    },
  ];

  const rewards: Info[] = orderDetail.value?.rewards?.length
    ? [
        {
          id: "1",
          label: t(localeKeys.transaction),
          details: (
            <>
              {orderDetail.value.rewards[0].txHash?.length ? (
                <RenderTxHash hash={orderDetail.value.rewards[0].txHash} />
              ) : orderDetail.value.rewards[0].extrinsicIndex || orderDetail.value.rewards[0].extrinsicIndex === 0 ? (
                <RenderTxHash
                  hash={`${orderDetail.value.rewards[0].blockNumber}-${orderDetail.value.rewards[0].extrinsicIndex}`}
                />
              ) : (
                "-"
              )}
            </>
          ),
        },
        ...(orderDetail.value.rewards
          .filter((item) => item.relayerRole === "Assigned")
          .map((item, index) => ({
            id: `2-${index}`,
            label: t(localeKeys.assignedRelayer),
            details: (
              <div className={"flex flex-col lg:flex-row lg:gap-[0.625rem]"}>
                <AccountName address={item.relayer.address} className={"text-primary text-12-bold lg:text-14-bold"} />
                {nativeToken && (
                  <div className={"text-12 lg:text-14"}>
                    (+
                    {formatBalance(item.amount, nativeToken.decimals, nativeToken.symbol, {
                      decimals: isEthChain(sourceChain) ? ETH_BALANCE_DECIMALS : undefined,
                    })}
                    )
                  </div>
                )}
              </div>
            ),
          })) || []),
        ...(orderDetail.value.rewards
          .filter((item) => item.relayerRole === "Delivery")
          .map((item, index) => ({
            id: `3-${index}`,
            label: t(localeKeys.deliveryRelayer),
            details: (
              <div className={"flex flex-col lg:flex-row lg:gap-[0.625rem]"}>
                <AccountName address={item.relayer.address} className={"text-primary text-12-bold lg:text-14-bold"} />
                {nativeToken && (
                  <div className={"text-12 lg:text-14"}>
                    (+
                    {formatBalance(item.amount, nativeToken.decimals, nativeToken.symbol, {
                      decimals: isEthChain(sourceChain) ? ETH_BALANCE_DECIMALS : undefined,
                    })}
                    )
                  </div>
                )}
              </div>
            ),
          })) || []),
        ...(orderDetail.value.rewards
          .filter((item) => item.relayerRole === "Confirmation")
          .map((item, index) => ({
            id: `4-${index}`,
            label: t(localeKeys.confirmationRelayer),
            details: (
              <div className={"flex flex-col lg:flex-row lg:gap-[0.625rem]"}>
                <AccountName address={item.relayer.address} className={"text-primary text-12-bold lg:text-14-bold"} />
                {nativeToken && (
                  <div className={"text-12 lg:text-14"}>
                    (+
                    {formatBalance(item.amount, nativeToken.decimals, nativeToken.symbol, {
                      decimals: isEthChain(sourceChain) ? ETH_BALANCE_DECIMALS : undefined,
                    })}
                    )
                  </div>
                )}
              </div>
            ),
          })) || []),
        ...(orderDetail.value.treasuryAmount && nativeToken
          ? [
              {
                id: "6",
                label: t(localeKeys.treasury),
                details: `+${formatBalance(orderDetail.value.treasuryAmount, nativeToken.decimals, nativeToken.symbol, {
                  decimals: isEthChain(sourceChain) ? ETH_BALANCE_DECIMALS : undefined,
                })}`,
              },
            ]
          : []),
      ]
    : [];

  const slash: Info[] = orderDetail.value?.slashes?.length
    ? [
        {
          id: "1",
          label: t(localeKeys.transaction),
          details: (
            <>
              {orderDetail.value.slashes[0].txHash?.length ? (
                <RenderTxHash hash={orderDetail.value.slashes[0].txHash} />
              ) : orderDetail.value.slashes[0].extrinsicIndex || orderDetail.value.slashes[0].extrinsicIndex === 0 ? (
                <RenderTxHash
                  hash={`${orderDetail.value.slashes[0].blockNumber}-${orderDetail.value.slashes[0].extrinsicIndex}`}
                />
              ) : (
                "-"
              )}
            </>
          ),
        },
        ...(orderDetail.value.slashes.map((item, index) => ({
          id: `2-${index}`,
          label: t(localeKeys.assignedRelayer),
          details: (
            <div className={"flex flex-col lg:flex-row lg:gap-[0.625rem]"}>
              <AccountName address={item.relayer.address} className={"text-primary text-12-bold lg:text-14-bold"} />
              {nativeToken && (
                <div className={"text-12 lg:text-14"}>
                  (-
                  {formatBalance(item.amount, nativeToken.decimals, nativeToken.symbol, {
                    decimals: isEthChain(sourceChain) ? ETH_BALANCE_DECIMALS : undefined,
                  })}
                  )
                </div>
              )}
            </div>
          ),
        })) || []),
      ]
    : [];

  return (
    <Spinner isLoading={orderDetail.loading} maskClassName="justify-start">
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
              <Tooltip
                extendTriggerToPopover={true}
                offset={[0, 10]}
                toolTipClassName={"border-2 !rounded-[0.3125rem]"}
                message={
                  <div className={"flex items-center gap-[0.625rem]"}>
                    <div className={"text-10"}>{t(localeKeys.assignedRelayer)}:</div>
                    {slot.relayer ? (
                      <AccountName address={slot.relayer} className={"text-12-bold text-primary"} />
                    ) : (
                      "-"
                    )}
                  </div>
                }
              >
                <div
                  className={`hidden justify-center w-[8.25rem] py-[0.3125rem] relative lg:flex ${pcBorderClass} ${pcRoundClass}`}
                >
                  {showProgressBall && (
                    <div className={"cursor-default absolute h-[1.75rem] w-[2px] bg-white -top-[1.9075rem]"}>
                      <div
                        className={"absolute w-[0.875rem] h-[0.875rem] bg-primary -left-[0.375rem] top-0 rounded-full"}
                      />
                    </div>
                  )}
                  <div className={`self-center text-12-bold ${slot.isOutOfSlot ? "text-halfWhite" : ""}`}>
                    {slot.isOutOfSlot ? t(localeKeys.outOfSlot) : t(localeKeys.slotNumber, { slotNumber: index + 1 })}
                  </div>
                </div>
              </Tooltip>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const RenderTxHash = ({ hash }: { hash: string }) => {
  const { sourceChain } = useMarket();

  const sub = "tx/";
  const chainConfig = isEthChain(sourceChain)
    ? getEthChainConfig(sourceChain)
    : isPolkadotChain(sourceChain)
    ? getPolkadotChainConfig(sourceChain)
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
  const { sourceChain } = useMarket();

  const sub = "block/";
  const chainConfig = isEthChain(sourceChain)
    ? getEthChainConfig(sourceChain)
    : isPolkadotChain(sourceChain)
    ? getPolkadotChainConfig(sourceChain)
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

const AccountAddress = ({ address, className }: { address: string; className?: string }) => {
  const { sourceChain } = useMarket();

  const sub = isEthChain(sourceChain) ? "address/" : isPolkadotChain(sourceChain) ? "account/" : null;
  const chainConfig = isEthChain(sourceChain)
    ? getEthChainConfig(sourceChain)
    : isPolkadotChain(sourceChain)
    ? getPolkadotChainConfig(sourceChain)
    : null;

  return (
    <a
      className={`hover:opacity-80 ${className}`}
      rel="noopener noreferrer"
      target={"_blank"}
      href={sub && chainConfig ? `${chainConfig.explorer.url}${sub}${address}` : "#"}
    >
      {address}
    </a>
  );
};

const AccountName = ({ address, className }: { address: string; className?: string }) => {
  const { currentMarket } = useMarket();
  const { displayName } = useAccountName(address);

  const urlSearchParams = new URLSearchParams();
  if (currentMarket) {
    urlSearchParams.set(UrlSearchParamsKey.FROM, formatUrlChainName(currentMarket.source));
    urlSearchParams.set(UrlSearchParamsKey.TO, formatUrlChainName(currentMarket.destination));
  }
  urlSearchParams.set(UrlSearchParamsKey.ID, address);
  const to = `/relayers-overview/details?${urlSearchParams.toString()}`;

  return (
    <NavLink className={`hover:opacity-80 ${className}`} to={to}>
      {displayName}
    </NavLink>
  );
};

export default OrderDetails;
