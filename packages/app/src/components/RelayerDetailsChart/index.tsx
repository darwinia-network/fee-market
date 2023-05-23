import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import { utils as ethersUtils } from "ethers";
import { BN } from "@polkadot/util";
import { RewardsSlashChart } from "../Chart/RewardsSlashChart";
import { QuoteHistoryChart } from "../Chart/QuoteHistoryChart";
import { useMemo } from "react";
import { isEthChain, isPolkadotChain, getEthChainConfig, getPolkadotChainConfig } from "../../utils";
import { useMarket, useQuoteHistory, useRewardSlash } from "../../hooks";

const convertItem = (item: [number, BN], decimals = 9): [number, number] => {
  return [item[0], Number(ethersUtils.formatUnits(item[1].toString(), decimals))];
};

const RelayerDetailsChart = () => {
  const { t } = useTranslation();
  const { sourceChain } = useMarket();
  const { rewardSlash } = useRewardSlash();
  const { quoteHistory } = useQuoteHistory();

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
      <RewardsSlashChart
        title={t(localeKeys.rewardsOrSlash, { currency: nativeToken?.symbol || "-" })}
        rewards={rewardSlash.rewards.map((item) => convertItem(item, nativeToken?.decimals))}
        slash={rewardSlash.slashs.map((item) => convertItem(item, nativeToken?.decimals))}
        loading={rewardSlash.loading}
      />
      <QuoteHistoryChart
        title={t(localeKeys.quoteHistory, { currency: nativeToken?.symbol || "-" })}
        data={quoteHistory.data.map((item) => convertItem(item, nativeToken?.decimals))}
        loading={quoteHistory.loading}
      />
    </div>
  );
};

export default RelayerDetailsChart;
