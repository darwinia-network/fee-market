import Account from "../Account";
import Balance from "../Balance";
import RelayerDetailsChart from "../RelayerDetailsChart";
import RelayerDetailsTable from "../RelayerDetailsTable";
import { Button, SlideDownUp } from "@darwinia/ui";
import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import { useState } from "react";

import type { FeeMarketSourceChainPolkadot } from "@feemarket/app-types";
import { POLKADOT_CHAIN_CONF } from "@feemarket/app-config";
import { useFeeMarket } from "@feemarket/app-provider";
import { useRelayersDetailData } from "@feemarket/app-hooks";

const relayerAddress = "5D2ZU3QVvebrKu8bLMFntMDEAXyQnhSx7C2Nk9t3gWTchMDS";

const RelayerDashboard = () => {
  const { t } = useTranslation();
  const { currentMarket, setRefresh } = useFeeMarket();
  const { rewardAndSlashData, quoteHistoryData, relayerRelatedOrdersData } = useRelayersDetailData({
    relayerAddress,
    currentMarket,
    setRefresh,
  });
  const [isNotificationVisible, setNotificationVisibility] = useState(true);

  const nativeToken = POLKADOT_CHAIN_CONF[currentMarket?.source as FeeMarketSourceChainPolkadot]
    ? POLKADOT_CHAIN_CONF[currentMarket?.source as FeeMarketSourceChainPolkadot].nativeToken
    : null;

  const onSwitchNetwork = () => {
    console.log("switch network====");
    onShowNotification();
  };

  const onShowNotification = () => {
    setNotificationVisibility((isVisible) => !isVisible);
  };

  const onHideNotification = () => {
    setNotificationVisibility(false);
  };

  return (
    /*Don't use flex gap to avoid a "junky gap animation" when the notification slides down */
    <div className={"flex flex-col"}>
      {/*Notification*/}
      <SlideDownUp isVisible={isNotificationVisible}>
        <div className={"mb-[0.9375rem] lg:mb-[1.875rem]"}>
          <div
            className={
              "card flex flex-col lg:flex-row lg:justify-between bg-danger gap-[0.9375rem] px-[0.9375rem] py-[1.125rem]"
            }
          >
            <div className={"flex-1"}>{t(localeKeys.switchAccountNotice)}</div>
            <div>
              <Button onClick={onSwitchNetwork} className={"bg-white text-danger"}>
                {t(localeKeys.switchNetwork)}
              </Button>
            </div>
          </div>
        </div>
      </SlideDownUp>
      <div className={"mb-[0.9375rem] lg:mb-[1.875rem]"}>
        <Account advanced={true} />
      </div>
      <div className={"mb-[0.9375rem] lg:mb-[1.875rem]"}>
        <Balance />
      </div>
      {/*Charts*/}
      <div className={"mb-[0.9375rem] lg:mb-[1.875rem]"}>
        <RelayerDetailsChart
          currentMarket={currentMarket}
          rewardsData={rewardAndSlashData?.rewards || []}
          slashesData={rewardAndSlashData?.slashs || []}
          quoteHistoryData={quoteHistoryData || []}
        />
      </div>

      {/*Relayer Orders table*/}
      <div>
        <RelayerDetailsTable
          relatedOrdersData={relayerRelatedOrdersData}
          tokenSymbol={nativeToken?.symbol}
          tokenDecimals={nativeToken?.decimals}
        />
      </div>
    </div>
  );
};

export default RelayerDashboard;
