import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import helpIcon from "../../assets/images/help.svg";
import editIcon from "../../assets/images/edit.svg";
import ModifyQuoteModal from "../ModifyQuoteModal";
import { useEffect, useState } from "react";
import ModifyCollateralBalanceModal from "../ModifyCollateralBalanceModal";
import { Tooltip } from "@darwinia/ui";

import { BigNumber, utils as ethersUtils, Contract } from "ethers";
import { useFeeMarket, useApi } from "@feemarket/app-provider";
import { ETH_CHAIN_CONF, POLKADOT_CHAIN_CONF } from "@feemarket/app-config";
import { isEthApi, isEthChain } from "@feemarket/app-utils";
import type { FeeMarketSourceChainPolkadot, FeeMarketSourceChainEth } from "@feemarket/app-types";

const formatBalance = (
  amount: BigNumber | null | undefined,
  decimals: number | null | undefined,
  symbol: string | null | undefined
): string => {
  if (amount && decimals && symbol) {
    return `${ethersUtils.commify(ethersUtils.formatUnits(amount, decimals))} ${symbol}`;
  }
  return "-";
};

interface Props {
  relayerAddress: string;
}

const Balance = ({ relayerAddress }: Props) => {
  const { t } = useTranslation();
  const { currentMarket } = useFeeMarket();
  const { api } = useApi();
  const [isModifyQuoteModalVisible, setModifyQuoteModalVisible] = useState(false);
  const [isModifyCollateralBalanceModalVisible, setModifyCollateralBalanceModalVisible] = useState(false);
  const [collateralAmount, setCollateralAmount] = useState<BigNumber | null>(null);
  const [currentLockedAmount, setCurrentLockedAmount] = useState<BigNumber | null>(null);
  const [currentQuoteAmount, setCurrentQuoteAmount] = useState<BigNumber | null>(null);

  const nativeToken =
    ETH_CHAIN_CONF[currentMarket?.source as FeeMarketSourceChainEth]?.nativeToken ??
    POLKADOT_CHAIN_CONF[currentMarket?.source as FeeMarketSourceChainPolkadot]?.nativeToken ??
    null;

  const onShowModifyQuoteModal = () => {
    setModifyQuoteModalVisible(true);
  };

  const onModifyQuoteModalClose = () => {
    setModifyQuoteModalVisible(false);
  };

  const onShowModifyCollateralBalanceModal = () => {
    setModifyCollateralBalanceModalVisible(true);
  };

  const onModifyCollateralBalanceModalClose = () => {
    setModifyCollateralBalanceModalVisible(false);
  };

  useEffect(() => {
    if (currentMarket?.source && isEthChain(currentMarket.source) && isEthApi(api)) {
      const chainConfig = ETH_CHAIN_CONF[currentMarket.source];
      const contract = new Contract(chainConfig.contractAddress, chainConfig.contractInterface, api);

      (contract.balanceOf(relayerAddress) as Promise<BigNumber>).then(setCollateralAmount).catch((error) => {
        setCollateralAmount(null);
        console.error("get collateral:", error);
      });

      (contract.lockedOf(relayerAddress) as Promise<BigNumber>).then(setCurrentLockedAmount).catch((error) => {
        setCurrentLockedAmount(null);
        console.error("get currently locked:", error);
      });

      (contract.feeOf(relayerAddress) as Promise<BigNumber>).then(setCurrentQuoteAmount).catch((error) => {
        setCurrentQuoteAmount(null);
        console.error("get current quote:", error);
      });
    }
  }, [api, currentMarket, relayerAddress]);

  return (
    <div className={"flex flex-col lg:flex-row gap-[0.9375rem] lg:gap-[1.875rem]"}>
      <div className={"card bg-primary flex flex-col lg:flex-row flex-1 gap-[1.875rem] lg:gap-[3.75rem]"}>
        {/*collateral balance*/}
        <div
          className={
            "flex flex-1 flex-col gap-[0.625rem] relative after:absolute after:left-0 after:right-0 after:h-[1px] lg:after:h-[auto] lg:after:w-[1px] after:bg-white after:-bottom-[0.9375rem] lg:after:bottom-[8px] lg:after:top-[8px] lg:after:left-[auto] lg:after:-right-[1.875rem]"
          }
        >
          <div className={"flex items-center"}>
            <div className={"text-14-bold"}>{t(localeKeys.collateralBalance)}</div>
            <Tooltip
              placement={"right"}
              message={<div dangerouslySetInnerHTML={{ __html: t(localeKeys.collateralBalanceTooltip) }} />}
              className={"flex pl-[0.625rem]"}
            >
              <img className={"clickable w-[0.875rem] h-[0.875rem] self-center"} src={helpIcon} alt="image" />
            </Tooltip>
          </div>
          <div className={"flex"}>
            <div className={"text-24-bold uppercase"}>
              {formatBalance(collateralAmount, nativeToken?.decimals, nativeToken?.symbol)}
            </div>
            <div onClick={onShowModifyCollateralBalanceModal} className={"flex pl-[0.625rem]"}>
              <img className={"clickable w-[1.5rem] h-[1.5rem] self-center"} src={editIcon} alt="image" />
            </div>
          </div>
        </div>
        {/*currently locked*/}
        <div className={"flex flex-1 flex-col gap-[0.625rem]"}>
          <div className={"flex items-center"}>
            <div className={"text-14-bold"}>{t(localeKeys.currentlyLocked)}</div>
            <Tooltip
              placement={"right"}
              message={<div dangerouslySetInnerHTML={{ __html: t(localeKeys.currentlyLockedTooltip) }} />}
              className={"flex pl-[0.625rem]"}
            >
              <img className={"clickable w-[0.875rem] h-[0.875rem] self-center"} src={helpIcon} alt="image" />
            </Tooltip>
          </div>
          <div className={"flex"}>
            <div className={"text-24-bold uppercase"}>
              {formatBalance(currentLockedAmount, nativeToken?.decimals, nativeToken?.symbol)}
            </div>
          </div>
        </div>
      </div>
      {/*Current quote*/}
      <div className={"card flex-1 lg:shrink-0 lg:min-w-[23.9%] lg:flex-initial bg-blackSecondary"}>
        <div className={"flex flex-1 flex-col gap-[0.625rem]"}>
          <div className={"flex items-center"}>
            <div className={"text-14-bold"}>{t(localeKeys.currentQuote)}</div>
            <Tooltip
              placement={"left"}
              message={<div dangerouslySetInnerHTML={{ __html: t(localeKeys.currentQuoteTooltip) }} />}
              className={"flex pl-[0.625rem]"}
              toolTipClassName={"!w-[16.75rem]"}
            >
              <img className={"clickable w-[0.875rem] h-[0.875rem] self-center"} src={helpIcon} alt="image" />
            </Tooltip>
          </div>
          <div className={"flex"}>
            <div className={"text-24-bold uppercase"}>
              {t(localeKeys.quotePhrase, {
                amount: formatBalance(currentQuoteAmount, nativeToken?.decimals, nativeToken?.symbol),
              })}
            </div>
            <div onClick={onShowModifyQuoteModal} className={"flex pl-[0.625rem]"}>
              <img className={"clickable w-[1.5rem] h-[1.5rem] self-center"} src={editIcon} alt="image" />
            </div>
          </div>
        </div>
      </div>
      {/*Modify quote modal*/}
      <ModifyQuoteModal onClose={onModifyQuoteModalClose} isVisible={isModifyQuoteModalVisible} />
      {/*Modify balance modal*/}
      <ModifyCollateralBalanceModal
        onClose={onModifyCollateralBalanceModalClose}
        isVisible={isModifyCollateralBalanceModalVisible}
        currentCollateral={collateralAmount || BigNumber.from(0)}
      />
    </div>
  );
};

export default Balance;
