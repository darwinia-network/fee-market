import { Input, ModalEnhanced } from "@darwinia/ui";
import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import { ChangeEvent, useEffect, useState } from "react";

import { formatBalance, isEthApi, isEthChain } from "@feemarket/app-utils";
import { BALANCE_DECIMALS, ETH_CHAIN_CONF, POLKADOT_CHAIN_CONF } from "@feemarket/app-config";
import { BigNumber, utils as ethersUtils, Contract } from "ethers";
import { useFeeMarket, useApi } from "@feemarket/app-provider";
import type { FeeMarketSourceChainEth, FeeMarketSourceChainPolkadot } from "@feemarket/app-types";
import { forkJoin, Subscription, from, of, switchMap, zip } from "rxjs";

export interface ModifyCollateralBalanceModalProps {
  isVisible: boolean;
  currentCollateral: BigNumber;
  onClose: () => void;
}

const ModifyCollateralBalanceModal = ({ isVisible, currentCollateral, onClose }: ModifyCollateralBalanceModalProps) => {
  const { t } = useTranslation();
  const { currentMarket } = useFeeMarket();
  const { api } = useApi();
  const [isModalVisible, setModalVisibility] = useState(false);
  const [deposit, setDeposit] = useState("");
  const [feeEstimation, setFeeEstimation] = useState<BigNumber | null>(null);
  const [depositError, setDepositError] = useState<JSX.Element | null>(null);

  const nativeToken =
    ETH_CHAIN_CONF[currentMarket?.source as FeeMarketSourceChainEth]?.nativeToken ??
    POLKADOT_CHAIN_CONF[currentMarket?.source as FeeMarketSourceChainPolkadot]?.nativeToken ??
    null;

  useEffect(() => {
    setModalVisibility(isVisible);
  }, [isVisible]);

  const onCloseModal = () => {
    setModalVisibility(false);
    onClose();
  };

  const onCancelModal = () => {
    onCloseModal();
  };

  const onModifyQuote = () => {
    if (parseInt(deposit) < 15) {
      setDepositError(generateError(t(localeKeys.depositAmountLimitError, { amount: `15 ${nativeToken?.symbol}` })));
      return;
    }
    console.log("quote====", deposit);
    onCloseModal();
  };

  const onDepositChanged = (e: ChangeEvent<HTMLInputElement>) => {
    setDepositError(null);
    const value = e.target.value;
    setDeposit(value);
  };

  // Estimate fee
  useEffect(() => {
    let sub$$: Subscription;

    if (
      currentMarket?.source &&
      isEthChain(currentMarket.source) &&
      isEthApi(api) &&
      nativeToken?.decimals &&
      deposit
    ) {
      const depositAmount = ethersUtils.parseUnits(deposit, nativeToken.decimals);

      const chainConfig = ETH_CHAIN_CONF[currentMarket.source];
      const contract = new Contract(chainConfig.contractAddress, chainConfig.contractInterface, api);

      if (depositAmount.gt(currentCollateral)) {
        sub$$ = from(api.getGasPrice())
          .pipe(
            switchMap((gasPrice) =>
              zip(
                of(gasPrice),
                from(
                  contract.estimateGas.deposit({
                    value: depositAmount.sub(currentCollateral),
                    gasPrice,
                  }) as Promise<BigNumber>
                )
              )
            )
          )
          .subscribe({
            next: ([gasPrice, gas]) => {
              setFeeEstimation(gas.mul(gasPrice));
            },
            error: (error) => {
              setFeeEstimation(null);
              console.error("estimate deposit:", error);
            },
          });
      } else if (depositAmount.lt(currentCollateral)) {
        sub$$ = from(api.getGasPrice())
          .pipe(
            switchMap((gasPrice) =>
              zip(
                of(gasPrice),
                from(
                  contract.estimateGas.withdraw(currentCollateral.sub(depositAmount), {
                    gasPrice,
                  }) as Promise<BigNumber>
                )
              )
            )
          )
          .subscribe({
            next: ([gasPrice, gas]) => {
              setFeeEstimation(gas.mul(gasPrice));
            },
            error: (error) => {
              setFeeEstimation(null);
              console.error("estimate withdraw:", error);
            },
          });
      }
    } else {
      setFeeEstimation(null);
    }

    return () => {
      if (sub$$) {
        sub$$.unsubscribe();
      }
    };
  }, [deposit, api, currentMarket, currentCollateral]);

  return (
    <ModalEnhanced
      onCancel={onCancelModal}
      onClose={onCloseModal}
      cancelText={t(localeKeys.cancel)}
      confirmText={t(localeKeys.confirm)}
      onConfirm={onModifyQuote}
      isVisible={isModalVisible}
      modalTitle={t(localeKeys.modifyCollateralBalance)}
    >
      <div className={"flex flex-col gap-[1.25rem]"}>
        {/*Your current balance*/}
        <div className={"flex flex-col gap-[0.625rem]"}>
          <div className={"text-12-bold"}>{t(localeKeys.yourCollateralBalance)}</div>
          <div className={"flex bg-divider rounded-[0.3125rem] h-[2.5rem] items-center justify-end px-[0.625rem]"}>
            <div className={"flex-1 text-14-bold"}>
              {ethersUtils.commify(ethersUtils.formatUnits(currentCollateral, nativeToken?.decimals))}
            </div>
            <div className={"flex-1 text-right text-14-bold"}>{nativeToken?.symbol}</div>
          </div>
        </div>

        {/*Your new balancce*/}
        <div className={"flex flex-col gap-[0.625rem]"}>
          <div className={"text-12-bold"}>{t(localeKeys.youModifyBalanceTo)}</div>
          <Input
            value={deposit}
            error={depositError}
            leftIcon={null}
            className={"!text-14-bold"}
            onChange={onDepositChanged}
            rightSlot={<div className={"text-14-bold flex items-center px-[0.625rem]"}>{nativeToken?.symbol}</div>}
          />
        </div>
        <div className={"bg-divider w-full h-[1px]"} />

        <div className={"flex flex-col gap-[0.625rem]"}>
          {t(localeKeys.feeEstimation, {
            amount: formatBalance(feeEstimation, nativeToken?.decimals, nativeToken?.symbol, {
              precision: BALANCE_DECIMALS,
            }),
          })}
        </div>
      </div>
    </ModalEnhanced>
  );
};

const generateError = (error: string) => {
  return <div>{error}</div>;
};

export default ModifyCollateralBalanceModal;
