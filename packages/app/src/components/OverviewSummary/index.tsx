import { useTranslation } from "react-i18next";
import { formatDistanceStrict } from "date-fns";
import { utils as ethersUtils, BigNumber } from "ethers";
import type { BN } from "@polkadot/util";
import localeKeys from "../../locale/localeKeys";
import {
  formatBalance,
  getEthChainConfig,
  getPolkadotChainConfig,
  isEthChain,
  isPolkadotChain,
} from "@feemarket/utils";
import type { Market } from "@feemarket/market";
import { useMemo } from "react";

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

const formatCurrentFee = (fee?: BN | BigNumber | null, decimals?: number | null, symbol?: string | null): string => {
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

interface Props {
  averageSpeed: {
    value: number | string | null | undefined;
    loading: boolean;
  };
  totalOrders: {
    value: number | null | undefined;
    loading: boolean;
  };
  totalRelayers: {
    total: number | null | undefined;
    active: number | null | undefined;
    loading: boolean;
  };
  totalReward: {
    value: BN | null | undefined;
    loading: boolean;
  };
  currentFee: {
    value: BN | BigNumber | null | undefined;
    loading: boolean;
  };
  currentMarket: Market | null;
}

const OverviewSummary = ({
  currentMarket,
  averageSpeed,
  totalOrders,
  totalRelayers,
  totalReward,
  currentFee,
}: Props) => {
  const { t } = useTranslation();

  const sourceChain = currentMarket?.source;
  // const destinationChain = currentMarket?.destination;

  const nativeToken = useMemo(() => {
    if (isEthChain(sourceChain)) {
      return getEthChainConfig(sourceChain).nativeToken;
    } else if (isPolkadotChain(sourceChain)) {
      return getPolkadotChainConfig(sourceChain).nativeToken;
    }
    return null;
  }, [sourceChain]);

  const summaryData = [
    {
      title: t(localeKeys.totalRelayers),
      data: formatRelayers(totalRelayers.active, totalRelayers.total),
    },
    { title: t(localeKeys.averageSpeed), data: formatSpeed(averageSpeed.value) },
    {
      title: t(localeKeys.currentMessageFee),
      data: formatCurrentFee(currentFee.value, nativeToken?.decimals, nativeToken?.symbol),
    },
    {
      title: t(localeKeys.totalRewards),
      data: formatRewards(totalReward.value, nativeToken?.decimals, nativeToken?.symbol),
    },
    { title: t(localeKeys.totalOrders), data: formatOrders(totalOrders.value) },
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
