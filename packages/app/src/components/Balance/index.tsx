import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import helpIcon from "../../assets/images/help.svg";
import editIcon from "../../assets/images/edit.svg";
import ModifyQuoteModal from "../ModifyQuoteModal";
import { useState, useMemo } from "react";
import ModifyCollateralBalanceModal from "../ModifyCollateralBalanceModal";
import { Tooltip } from "@darwinia/ui";
import { isEthChain, formatBalance, isPolkadotChain, getEthChainConfig, getPolkadotChainConfig } from "../../utils";
import { useRelayer, useMarket } from "../../hooks";

const Balance = ({ matchNetwork }: { matchNetwork?: boolean }) => {
  const { t } = useTranslation();
  const { currentMarket } = useMarket();
  const { isRegistered, collateralAmount, currentLockedAmount, currentQuoteAmount } = useRelayer();

  const [isModifyQuoteModalVisible, setModifyQuoteModalVisible] = useState(false);
  const [isModifyCollateralBalanceModalVisible, setModifyCollateralBalanceModalVisible] = useState(false);

  const sourceChain = currentMarket?.source;

  const nativeToken = useMemo(() => {
    if (isEthChain(sourceChain)) {
      return getEthChainConfig(sourceChain).nativeToken;
    } else if (isPolkadotChain(sourceChain)) {
      return getPolkadotChainConfig(sourceChain).nativeToken;
    }
    return null;
  }, [sourceChain]);

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
            {nativeToken && (
              <div className={"text-24-bold uppercase"}>
                {formatBalance(collateralAmount, nativeToken.decimals, nativeToken.symbol)}
              </div>
            )}
            {matchNetwork && (isRegistered || isEthChain(sourceChain)) ? (
              <div onClick={() => setModifyCollateralBalanceModalVisible(true)} className={"flex pl-[0.625rem]"}>
                <img className={"clickable w-[1.5rem] h-[1.5rem] self-center"} src={editIcon} alt="image" />
              </div>
            ) : null}
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
            {nativeToken && (
              <div className={"text-24-bold uppercase"}>
                {formatBalance(currentLockedAmount, nativeToken.decimals, nativeToken.symbol)}
              </div>
            )}
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
            {nativeToken && (
              <div className={"text-24-bold text-primary"}>
                {t(localeKeys.quotePhrase, {
                  amount: formatBalance(currentQuoteAmount, nativeToken.decimals, nativeToken.symbol.toUpperCase()),
                })}
              </div>
            )}
            {matchNetwork && isRegistered ? (
              <div onClick={() => setModifyQuoteModalVisible(true)} className={"flex pl-[0.625rem]"}>
                <img className={"clickable w-[1.5rem] h-[1.5rem] self-center"} src={editIcon} alt="image" />
              </div>
            ) : null}
          </div>
        </div>
      </div>
      {/*Modify quote modal*/}
      <ModifyQuoteModal onClose={() => setModifyQuoteModalVisible(false)} isVisible={isModifyQuoteModalVisible} />
      {/*Modify balance modal*/}
      <ModifyCollateralBalanceModal
        onClose={() => setModifyCollateralBalanceModalVisible(false)}
        isVisible={isModifyCollateralBalanceModalVisible}
      />
    </div>
  );
};

export default Balance;
