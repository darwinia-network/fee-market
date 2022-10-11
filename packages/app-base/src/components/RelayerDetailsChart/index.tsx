import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";

import type { Market } from "@feemarket/app-provider";
import type { FeeMarketSourceChainEth, FeeMarketSourceChainPolkadot } from "@feemarket/app-types";
import { RewardAndSlashChart } from "../Chart/RewardAndSlashChart";
import { QuoteHistoryChart } from "../Chart/QuoteHistoryChart";
import { ETH_CHAIN_CONF, POLKADOT_CHAIN_CONF } from "@feemarket/app-config";

interface Props {
  currentMarket: Market | null;
  rewardsData: [number, number][];
  slashesData: [number, number][];
  quoteHistoryData: [number, number][];
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
        rewardData={rewardsData}
        slashData={slashesData}
      />
      <QuoteHistoryChart
        title={t(localeKeys.quoteHistory, { currency: nativeToken?.symbol || "-" })}
        data={quoteHistoryData}
      />
    </div>
  );
};

export default RelayerDetailsChart;
