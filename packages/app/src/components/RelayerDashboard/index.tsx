import Account from "../Account";
import Balance from "../Balance";
import RelayerDetailsChart from "../RelayerDetailsChart";
import RelayerDetailsTable from "../RelayerDetailsTable";
import { Button, SlideDownUp } from "@darwinia/ui";
import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import { useEffect, useState, useMemo } from "react";
import { useRelayerDetailData, useApi, useMarket } from "../../hooks";
import { isEthChain, isPolkadotChain, getEthChainConfig, getPolkadotChainConfig } from "../../utils";
import { useRelayer } from "../../hooks";
import { switchNetwork } from "@wagmi/core";

const RelayerDashboard = () => {
  const { t } = useTranslation();
  const { currentMarket } = useMarket();
  const { relayerAddress } = useRelayer();
  const { currentChainId } = useApi();
  const { rewardAndSlashData, quoteHistoryData, relayerRelatedOrdersData } = useRelayerDetailData({
    relayerAddress: relayerAddress.startsWith("0x") ? relayerAddress.toLowerCase() : relayerAddress,
  });
  const [isNotificationVisible, setNotificationVisibility] = useState(false);

  const sourceChain = currentMarket?.source;

  const nativeToken = useMemo(() => {
    if (isEthChain(sourceChain)) {
      return getEthChainConfig(sourceChain).nativeToken;
    } else if (isPolkadotChain(sourceChain)) {
      return getPolkadotChainConfig(sourceChain).nativeToken;
    }
    return null;
  }, [sourceChain]);

  const handleSwitchNetwork = async () => {
    if (sourceChain && isEthChain(sourceChain)) {
      const { chainId } = getEthChainConfig(sourceChain);
      await switchNetwork({ chainId });
    }
  };

  useEffect(() => {
    if (sourceChain && isEthChain(sourceChain) && getEthChainConfig(sourceChain).chainId !== currentChainId) {
      setNotificationVisibility(true);
    } else {
      setNotificationVisibility(false);
    }
  }, [sourceChain, currentChainId]);

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
            <div className={"flex-1 flex items-center"}>{t(localeKeys.switchAccountNotice)}</div>
            <div>
              <Button
                onClick={handleSwitchNetwork}
                className={"!bg-white w-full !text-danger !text-14-bold lg:!h-[1.875rem]"}
              >
                {t(localeKeys.switchNetwork)}
              </Button>
            </div>
          </div>
        </div>
      </SlideDownUp>
      <div className={"mb-[0.9375rem] lg:mb-[1.875rem]"}>
        <Account advanced={!isNotificationVisible} />
      </div>
      <div className={"mb-[0.9375rem] lg:mb-[1.875rem]"}>
        <Balance matchNetwork={!isNotificationVisible} />
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
