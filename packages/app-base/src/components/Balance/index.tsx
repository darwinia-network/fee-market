import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import helpIcon from "../../assets/images/help.svg";
import editIcon from "../../assets/images/edit.svg";
import ModifyQuoteModal from "../ModifyQuoteModal";
import { useCallback, useEffect, useState, useMemo } from "react";
import ModifyCollateralBalanceModal from "../ModifyCollateralBalanceModal";
import { Tooltip } from "@darwinia/ui";
import type { Option } from "@polkadot/types";
import { BigNumber, Contract } from "ethers";
import { useFeeMarket, useApi } from "@feemarket/app-provider";
import { ETH_CHAIN_CONF, POLKADOT_CHAIN_CONF } from "@feemarket/app-config";
import {
  isEthApi,
  isEthChain,
  formatBalance,
  isPolkadotApi,
  getFeeMarketApiSection,
  isPolkadotChain,
} from "@feemarket/app-utils";
import type {
  FeeMarketSourceChainPolkadot,
  FeeMarketSourceChainEth,
  PalletFeeMarketRelayer,
} from "@feemarket/app-types";
import { from, forkJoin, EMPTY } from "rxjs";

interface Props {
  registered?: boolean;
  matchNetwork?: boolean;
  relayerAddress: string;
}

const Balance = ({ relayerAddress, registered, matchNetwork }: Props) => {
  const { t } = useTranslation();
  const { currentMarket } = useFeeMarket();
  const { api } = useApi();
  const [isModifyQuoteModalVisible, setModifyQuoteModalVisible] = useState(false);
  const [isModifyCollateralBalanceModalVisible, setModifyCollateralBalanceModalVisible] = useState(false);
  const [collateralAmount, setCollateralAmount] = useState<BigNumber>(BigNumber.from(0));
  const [currentLockedAmount, setCurrentLockedAmount] = useState<BigNumber>(BigNumber.from(0));
  const [currentQuoteAmount, setCurrentQuoteAmount] = useState<BigNumber>(BigNumber.from(0));

  const sourceChain = currentMarket?.source;
  const destinationChain = currentMarket?.destination;

  const nativeToken = useMemo(
    () =>
      sourceChain
        ? ETH_CHAIN_CONF[sourceChain as FeeMarketSourceChainEth]?.nativeToken ??
          POLKADOT_CHAIN_CONF[sourceChain as FeeMarketSourceChainPolkadot]?.nativeToken ??
          null
        : null,
    [sourceChain]
  );

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

  const getQuoteLockedCollateral = useCallback(() => {
    if (matchNetwork && isEthChain(sourceChain) && isEthApi(api)) {
      const chainConfig = ETH_CHAIN_CONF[sourceChain];
      const contract = new Contract(chainConfig.contractAddress, chainConfig.contractInterface, api);

      return forkJoin([
        from(contract.balanceOf(relayerAddress) as Promise<BigNumber>),
        from(contract.lockedOf(relayerAddress) as Promise<BigNumber>),
        from(contract.feeOf(relayerAddress) as Promise<BigNumber>),
      ]).subscribe({
        next: ([collateral, locked, quote]) => {
          setCollateralAmount(collateral);
          setCurrentLockedAmount(locked);
          setCurrentQuoteAmount(quote);
        },
        error: (error) => {
          console.error("[collateral, locked, quote]:", error);
        },
      });
    } else if (registered && isPolkadotChain(destinationChain) && isPolkadotApi(api)) {
      const apiSection = getFeeMarketApiSection(api, destinationChain);
      if (apiSection) {
        return from(api.query[apiSection].relayersMap<Option<PalletFeeMarketRelayer>>(relayerAddress)).subscribe({
          next: (res) => {
            if (res.isSome) {
              const { collateral, fee } = res.unwrap();
              setCollateralAmount(BigNumber.from(collateral.toString()));
              setCurrentQuoteAmount(BigNumber.from(fee.toString()));
            }
          },
          error: (error) => {
            console.error("[collateral, locked, quote]:", error);
          },
        });
      }
      setCurrentLockedAmount(BigNumber.from(0));
    }

    return EMPTY.subscribe();
  }, [sourceChain, destinationChain, api, relayerAddress, matchNetwork, registered]);

  useEffect(() => {
    const sub$$ = getQuoteLockedCollateral();
    return () => {
      sub$$.unsubscribe();
      setCollateralAmount(BigNumber.from(0));
      setCurrentLockedAmount(BigNumber.from(0));
      setCurrentQuoteAmount(BigNumber.from(0));
    };
  }, [getQuoteLockedCollateral]);

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
            {registered && (
              <div onClick={onShowModifyCollateralBalanceModal} className={"flex pl-[0.625rem]"}>
                <img className={"clickable w-[1.5rem] h-[1.5rem] self-center"} src={editIcon} alt="image" />
              </div>
            )}
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
            <div className={"text-24-bold text-primary"}>
              {t(localeKeys.quotePhrase, {
                amount: formatBalance(currentQuoteAmount, nativeToken?.decimals, nativeToken?.symbol.toUpperCase()),
              })}
            </div>
            {registered && (
              <div onClick={onShowModifyQuoteModal} className={"flex pl-[0.625rem]"}>
                <img className={"clickable w-[1.5rem] h-[1.5rem] self-center"} src={editIcon} alt="image" />
              </div>
            )}
          </div>
        </div>
      </div>
      {/*Modify quote modal*/}
      <ModifyQuoteModal
        onClose={onModifyQuoteModalClose}
        onSuccess={getQuoteLockedCollateral}
        relayerAddress={relayerAddress}
        isVisible={isModifyQuoteModalVisible}
        currentQuote={currentQuoteAmount || BigNumber.from(0)}
      />
      {/*Modify balance modal*/}
      <ModifyCollateralBalanceModal
        onClose={onModifyCollateralBalanceModalClose}
        onSuccess={getQuoteLockedCollateral}
        relayerAddress={relayerAddress}
        isVisible={isModifyCollateralBalanceModalVisible}
        currentCollateral={collateralAmount || BigNumber.from(0)}
      />
    </div>
  );
};

export default Balance;
