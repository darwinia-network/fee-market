import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import { utils as ethersUtils } from "ethers";
import type { Market } from "@feemarket/app-provider";
import type { BN, FeeMarketSourceChainEth, FeeMarketSourceChainPolkadot } from "@feemarket/app-types";
import { RewardAndSlashChart } from "../Chart/RewardAndSlashChart";
import { QuoteHistoryChart } from "../Chart/QuoteHistoryChart";
import { ETH_CHAIN_CONF, POLKADOT_CHAIN_CONF } from "@feemarket/app-config";

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
  const nativeToken = currentMarket?.source
    ? ETH_CHAIN_CONF[currentMarket.source as FeeMarketSourceChainEth]?.nativeToken ??
      POLKADOT_CHAIN_CONF[currentMarket.source as FeeMarketSourceChainPolkadot]?.nativeToken ??
      null
    : null;

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
