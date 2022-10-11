import { Input, ModalEnhanced } from "@darwinia/ui";
import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import { ChangeEvent, useEffect, useState } from "react";

import {
  formatBalance,
  isEthApi,
  isEthChain,
  isPolkadotApi,
  isPolkadotChain,
  triggerContract,
  getFeeMarketApiSection,
} from "@feemarket/app-utils";
import { BALANCE_DECIMALS, ETH_CHAIN_CONF, POLKADOT_CHAIN_CONF } from "@feemarket/app-config";
import { BigNumber, utils as ethersUtils, Contract } from "ethers";
import { useFeeMarket, useApi } from "@feemarket/app-provider";
import type { FeeMarketSourceChainEth, FeeMarketSourceChainPolkadot } from "@feemarket/app-types";
import { Subscription, from, of, switchMap, zip } from "rxjs";
import { web3FromAddress } from "@polkadot/extension-dapp";

export interface ModifyCollateralBalanceModalProps {
  isVisible: boolean;
  currentCollateral: BigNumber;
  relayerAddress: string;
  onClose: () => void;
}

const ModifyCollateralBalanceModal = ({
  isVisible,
  currentCollateral,
  relayerAddress,
  onClose,
}: ModifyCollateralBalanceModalProps) => {
  const { t } = useTranslation();
  const { currentMarket } = useFeeMarket();
  const { api, accountBalance } = useApi();
  const [isModalVisible, setModalVisibility] = useState(false);
  const [deposit, setDeposit] = useState("");
  const [feeEstimation, setFeeEstimation] = useState<BigNumber | null>(null);
  const [depositError, setDepositError] = useState<JSX.Element | null>(null);

  const nativeToken = currentMarket?.source
    ? ETH_CHAIN_CONF[currentMarket.source as FeeMarketSourceChainEth]?.nativeToken ??
      POLKADOT_CHAIN_CONF[currentMarket.source as FeeMarketSourceChainPolkadot]?.nativeToken ??
      null
    : null;

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
    if (depositError) {
      return;
    }

    if (currentMarket?.source && isEthChain(currentMarket.source) && deposit) {
      if (Number(deposit) < 0.2) {
        setDepositError(generateError(t(localeKeys.depositAmountLimitError, { amount: `0.2 ${nativeToken?.symbol}` })));
        return;
      }

      if (isEthApi(api) && nativeToken?.decimals && deposit) {
        const depositAmount = ethersUtils.parseUnits(deposit, nativeToken.decimals);

        const chainConfig = ETH_CHAIN_CONF[currentMarket.source];
        const contract = new Contract(chainConfig.contractAddress, chainConfig.contractInterface, api.getSigner());

        if (depositAmount.gt(currentCollateral)) {
          triggerContract(
            contract,
            "deposit",
            [],
            {
              errorCallback: ({ error }) => {
                console.error("call deposit:", error);
              },
              responseCallback: ({ response }) => {
                onCloseModal();
                console.log("call deposit response:", response);
              },
              successCallback: ({ receipt }) => {
                console.log("call deposit receipt:", receipt);
              },
            },
            { value: depositAmount.sub(currentCollateral).toString() }
          );
        } else if (depositAmount.lt(currentCollateral)) {
          triggerContract(contract, "withdraw", [currentCollateral.sub(depositAmount)], {
            errorCallback: ({ error }) => {
              console.error("call withdraw:", error);
            },
            responseCallback: ({ response }) => {
              onCloseModal();
              console.log("call withdraw response:", response);
            },
            successCallback: ({ receipt }) => {
              console.log("call withdraw receipt:", receipt);
            },
          });
        } else {
          onCloseModal();
        }
      }
    } else if (
      currentMarket?.destination &&
      isPolkadotChain(currentMarket.destination) &&
      isPolkadotApi(api) &&
      deposit
    ) {
      if (Number(deposit) < 15) {
        setDepositError(generateError(t(localeKeys.depositAmountLimitError, { amount: `15 ${nativeToken?.symbol}` })));
        return;
      }

      const apiSection = getFeeMarketApiSection(api, currentMarket.destination);
      if (apiSection) {
        const depositAmount = ethersUtils.parseUnits(deposit, nativeToken?.decimals);

        const extrinsic = api.tx[apiSection].updateLockedCollateral(depositAmount.toString());
        from(web3FromAddress(relayerAddress))
          .pipe(switchMap((injector) => from(extrinsic.signAndSend(relayerAddress, { signer: injector.signer }))))
          .subscribe({
            next: (result) => {
              console.log("sign and send collateral update:", result.toString());
            },
            error: (error) => {
              onCloseModal();
              console.error("sign and send collateral uodate:", error);
            },
            complete: () => {
              onCloseModal();
            },
          });
      }
    } else {
      onCloseModal();
    }
  };

  const onDepositChanged = (e: ChangeEvent<HTMLInputElement>) => {
    setDepositError(null);
    const value = e.target.value;
    setDeposit(value);

    if (value) {
      const depositAmount = ethersUtils.parseUnits(value, nativeToken?.decimals);
      if (depositAmount.gt(currentCollateral) && depositAmount.sub(currentCollateral).gte(accountBalance)) {
        setDepositError(generateError(t(localeKeys.insufficientBalance)));
      }
    }
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
