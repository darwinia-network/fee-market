import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import { utils as ethersUtils } from "ethers";
import type { Market } from "@feemarket/market";
import { BN } from "@polkadot/util";
import { RewardAndSlashChart } from "../Chart/RewardAndSlashChart";
import { QuoteHistoryChart } from "../Chart/QuoteHistoryChart";
import { useMemo } from "react";
import { isEthChain, isPolkadotChain, getEthChainConfig, getPolkadotChainConfig } from "@feemarket/utils";

const convertItem = (item: [number, BN], decimals = 9): [number, number] => {
  return [item[0], Number(ethersUtils.formatUnits(item[1].toString(), decimals))];
};

interface Props {
  currentMarket: Market | null;
  rewardsData: [number, BN][];
  slashesData: [number, BN][];
  quoteHistoryData: [number, BN][];
}

const RelayerDetailsChart = ({ currentMarket, rewardsData, slashesData, quoteHistoryData }: Props) => {
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

  return (
    <div className={"grid grid-cols-1 lg:grid-cols-2 gap-x-[0.9375rem] gap-y-[0.9375rem] lg:gap-y-[1.875rem]"}>
      <RewardAndSlashChart
        title={t(localeKeys.rewardsOrSlash, { currency: nativeToken?.symbol || "-" })}
        rewardData={rewardsData.map((item) => convertItem(item, nativeToken?.decimals))}
        slashData={slashesData.map((item) => convertItem(item, nativeToken?.decimals))}
      />
      <QuoteHistoryChart
        title={t(localeKeys.quoteHistory, { currency: nativeToken?.symbol || "-" })}
        data={quoteHistoryData.map((item) => convertItem(item, nativeToken?.decimals))}
      />
    </div>
  );
};

export default RelayerDetailsChart;
