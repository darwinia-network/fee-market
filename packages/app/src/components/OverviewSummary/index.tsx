import { useTranslation } from "react-i18next";
import { formatDistanceStrict } from "date-fns";
import { utils as ethersUtils } from "ethers";
import type { BN } from "@polkadot/util";
import localeKeys from "../../locale/localeKeys";
import { formatBalance, getEthChainConfig, getPolkadotChainConfig, isEthChain, isPolkadotChain } from "../../utils";
import { useMemo } from "react";
import {
  useAverageSpeed,
  useCurrentFee,
  useMarket,
  useRelayerAmount,
  useTotalOrders,
  useTotalReward,
} from "../../hooks";
import { Spinner } from "@darwinia/ui";

const formatRelayers = (active?: number | null, total?: number | null): string => {
  const a = active || active === 0 ? `${active}` : "-";
  const t = total || total == 0 ? `${total}` : "-";
  return `${a} / ${t}`;
};

const formatSpeed = (speed?: number | string | null): string => {
  if (speed || speed === 0) {
    const now = Date.now();
    const distance = formatDistanceStrict(now, Number(now) + Number(speed)).split(" ");
    return `${distance[0]}${distance[1].slice(0, 1)}`;
  }
  return "-";
};

const formatCurrentFee = (fee?: BN | bigint | null, decimals?: number | null, symbol?: string | null): string => {
  if (fee && decimals && symbol) {
    return formatBalance(fee, decimals, symbol);
  }
  return "-";
};

const formatRewards = (rewards?: BN | null, decimals?: number | null, symbol?: string | null): string => {
  if (rewards && decimals) {
    return formatBalance(rewards, decimals, symbol);
  }
  return "-";
};

const formatOrders = (orders?: number | null): string => {
  if (orders) {
    return ethersUtils.commify(orders);
  }
  return "-";
};

export const OverviewSummary = () => {
  const { t } = useTranslation();
  const { relayerAmount } = useRelayerAmount();
  const { currentFee } = useCurrentFee();
  const { averageSpeed } = useAverageSpeed();
  const { totalOrders } = useTotalOrders();
  const { totalReward } = useTotalReward();
  const { sourceChain } = useMarket();

  const nativeToken = useMemo(() => {
    if (isEthChain(sourceChain)) {
      return getEthChainConfig(sourceChain).nativeToken;
    } else if (isPolkadotChain(sourceChain)) {
      return getPolkadotChainConfig(sourceChain).nativeToken;
    }
    return null;
  }, [sourceChain]);

  const summaries = [
    {
      title: t(localeKeys.totalRelayers),
      data: formatRelayers(relayerAmount.active, relayerAmount.total),
      loading: relayerAmount.loading,
    },
    { title: t(localeKeys.averageSpeed), data: formatSpeed(averageSpeed.value), loading: averageSpeed.loading },
    {
      title: t(localeKeys.currentMessageFee),
      data: formatCurrentFee(currentFee.value, nativeToken?.decimals, nativeToken?.symbol),
      loading: currentFee.loading,
    },
    {
      title: t(localeKeys.totalRewards),
      data: formatRewards(totalReward.value, nativeToken?.decimals, nativeToken?.symbol),
      loading: totalReward.loading,
    },
    { title: t(localeKeys.totalOrders), data: formatOrders(totalOrders.value), loading: totalOrders.loading },
  ];

  return (
    <div className="rounded-[0.625rem] bg-blackSecondary p-[0.9375rem] lg:p-[1.875rem] flex flex-col lg:flex-row lg:!gap-[2.5rem]">
      {summaries.map((item, index) => (
        <div
          key={index}
          className={
            "flex lg:flex-col flex-1 shrink-0 justify-between gap-[0.625rem] py-[0.9375rem] first:pt-0 lg:py-0 last:pb-0 border-b lg:border-b-0  border-divider last:border-[rgba(255,255,255,0)] relative lg:after:absolute lg:after:-right-[1.25rem] lg:after:top-[50%] lg:after:-translate-y-1/2 lg:after:h-[2.625rem]  lg:after:w-[1px]  lg:after:bg-divider lg:last:after:bg-[transparent]"
          }
        >
          <div className={"flex-1"}>{item.title}</div>
          <Spinner className="text-right lg:text-left flex-1 shrink-0 w-fit" size="small" isLoading={item.loading}>
            <span className="text-primary text-18-bold lg:text-24-bold">{item.data}</span>
          </Spinner>
        </div>
      ))}
    </div>
  );
};
