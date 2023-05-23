import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import { OrdersCountChart } from "../Chart/OrdersCountChart";
import { FeeHistoryChart } from "../Chart/FeeHistoryChart";
import { getEthChainConfig, getPolkadotChainConfig, isEthChain, isPolkadotChain, formatBalance } from "../../utils";
import { BN } from "@polkadot/util";
import { useMemo } from "react";
import { useMarket, useOrdersCount } from "../../hooks";
import { useFeeHistory } from "../../hooks/feeHistory";

const convertItem = (item: [number, BN], decimals = 9): [number, number] => {
  return [item[0], Number(formatBalance(item[1], decimals))];
};

const OverviewCharts = () => {
  const { t } = useTranslation();
  const { feeHistory } = useFeeHistory();
  const { ordersCount } = useOrdersCount();
  const { sourceChain } = useMarket();

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
      <OrdersCountChart title={t(localeKeys.ordersCount)} data={ordersCount.data} loading={ordersCount.loading} />
      <FeeHistoryChart
        title={t(localeKeys.feeHistory, { currency: nativeToken?.symbol || "-" })}
        data={feeHistory.data.map((item) => convertItem(item, nativeToken?.decimals))}
        loading={feeHistory.loading}
      />
    </div>
  );
};

export default OverviewCharts;
