import type { Market } from "@feemarket/app-provider";
import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import { OrdersCountChart } from "../Chart/OrdersCountChart";
import { FeeHistoryChart } from "../Chart/FeeHistoryChart";
import { ETH_CHAIN_CONF, POLKADOT_CHAIN_CONF } from "@feemarket/app-config";
import type { FeeMarketSourceChainEth, FeeMarketSourceChainPolkadot } from "@feemarket/app-types";

interface Props {
  currentMarket: Market | null;
  ordersCountData: [number, number][];
  feeHistoryData: [number, number][];
}

const OverviewCharts = ({ currentMarket, ordersCountData, feeHistoryData }: Props) => {
  const { t } = useTranslation();

  const nativeToken = currentMarket?.source
    ? ETH_CHAIN_CONF[currentMarket.source as FeeMarketSourceChainEth]?.nativeToken ??
      POLKADOT_CHAIN_CONF[currentMarket.source as FeeMarketSourceChainPolkadot]?.nativeToken ??
      null
    : null;

  return (
    <div className={"grid grid-cols-1 lg:grid-cols-2 gap-x-[0.9375rem] gap-y-[0.9375rem] lg:gap-y-[1.875rem]"}>
      <OrdersCountChart title={t(localeKeys.ordersCount)} data={ordersCountData} />
      <FeeHistoryChart
        title={t(localeKeys.feeHistory, { currency: nativeToken?.symbol || "-" })}
        data={feeHistoryData}
      />
    </div>
  );
};

export default OverviewCharts;
