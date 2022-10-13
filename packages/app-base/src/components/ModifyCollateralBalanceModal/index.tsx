import { Input, ModalEnhanced } from "@darwinia/ui";
import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import { ChangeEvent, useEffect, useState, useMemo, useCallback } from "react";
import {
  formatBalance,
  isEthApi,
  isEthChain,
  isPolkadotApi,
  isPolkadotChain,
  signAndSendTx,
  triggerContract,
  getFeeMarketApiSection,
  CallbackType,
} from "@feemarket/app-utils";
import { BALANCE_DECIMALS, ETH_CHAIN_CONF, POLKADOT_CHAIN_CONF } from "@feemarket/app-config";
import { BigNumber, utils as ethersUtils, Contract } from "ethers";
import { useFeeMarket, useApi } from "@feemarket/app-provider";
import { useBalance } from "@feemarket/app-hooks";
import type { FeeMarketSourceChainEth, FeeMarketSourceChainPolkadot } from "@feemarket/app-types";
import type { BN } from "@polkadot/util";

interface InputTips {
  text: string;
  error?: boolean;
}
interface Props {
  isVisible: boolean;
  relayerAddress: string;
  currentCollateral: BigNumber | BN;
  onClose: () => void;
}

const ModifyCollateralBalanceModal = ({ isVisible, relayerAddress, currentCollateral, onClose }: Props) => {
  const { t } = useTranslation();
  const { currentMarket } = useFeeMarket();
  const { api } = useApi();
  const { balance: relayerBalance } = useBalance(api, relayerAddress);

  const [fee] = useState<BigNumber | BN | null>(null);

  const [minCollateral] = useState<BN | BigNumber | null>(BigNumber.from(0));
  const [collteralTips, setCollateralTips] = useState<InputTips | null>(null);
  const [collateralInput, setCollateralInput] = useState<string | undefined>();

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

  const handleCollateralChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;

      setCollateralInput(value);
      setCollateralTips((previous) => (previous ? { ...previous, error: false } : null));

      if (nativeToken && minCollateral && relayerBalance.available) {
        const min = BigNumber.from(minCollateral.toString());
        const available = BigNumber.from(relayerBalance.available.toString());
        const input = ethersUtils.parseUnits(value || "0", nativeToken.decimals);

        if (input.gt(available)) {
          setCollateralTips({
            text: t(localeKeys.insufficientBalance),
            error: true,
          });
        } else {
          setCollateralTips({
            text: t(localeKeys.depositAmountLimitError, {
              amount: formatBalance(min, nativeToken.decimals, nativeToken.symbol),
            }),
            error: input.lt(min),
          });
        }
      }
    },
    [t, nativeToken, minCollateral, relayerBalance.available]
  );

  const handleConfirm = useCallback(() => {
    if (collteralTips?.error === false && collateralInput && nativeToken && relayerAddress && currentCollateral) {
      const inputAmount = ethersUtils.parseUnits(collateralInput, nativeToken.decimals);
      const currentAmount = BigNumber.from(currentCollateral.toString());

      if (isEthChain(sourceChain) && isEthApi(api)) {
        const chainConfig = ETH_CHAIN_CONF[sourceChain];
        const contract = new Contract(chainConfig.contractAddress, chainConfig.contractInterface, api.getSigner());

        const callback: CallbackType = {
          errorCallback: ({ error }) => {
            console.error("update collateral:", error);
          },
          responseCallback: ({ response }) => {
            onClose();
            console.log("update collateral response:", response);
          },
          successCallback: ({ receipt }) => {
            console.log("update collateral receipt:", receipt);
          },
        };

        if (inputAmount.gt(currentAmount)) {
          triggerContract(contract, "deposit", [], callback, { value: inputAmount.sub(currentAmount).toString() });
        } else if (inputAmount.lt(currentAmount)) {
          triggerContract(contract, "withdraw", [], callback, { value: currentAmount.sub(inputAmount).toString() });
        }
      } else if (isPolkadotChain(destinationChain) && isPolkadotApi(api)) {
        const apiSection = getFeeMarketApiSection(api, destinationChain);
        if (apiSection) {
          const extrinsic = api.tx[apiSection].updateLockedCollateral(inputAmount.toString());

          signAndSendTx({
            extrinsic,
            requireAddress: relayerAddress,
            txUpdateCb: onClose,
            txFailedCb: (error) => console.error(error),
          });
        }
      }
    }
  }, [collteralTips, collateralInput, nativeToken, relayerAddress, currentCollateral]);

  // Collateral input tips
  useEffect(() => {
    if (nativeToken && minCollateral) {
      const min = BigNumber.from(minCollateral.toString());
      setCollateralTips({
        error: false,
        text: t(localeKeys.depositAmountLimitError, {
          amount: formatBalance(min, nativeToken.decimals, nativeToken.symbol),
        }),
      });
    }

    return () => {
      setCollateralTips(null);
    };
  }, [t, nativeToken, minCollateral]);

  // Estimate fee
  // useEffect(() => {
  //   let sub$$: Subscription;

  //   if (
  //     currentMarket?.source &&
  //     isEthChain(currentMarket.source) &&
  //     isEthApi(api) &&
  //     nativeToken?.decimals &&
  //     deposit
  //   ) {
  //     const depositAmount = ethersUtils.parseUnits(deposit, nativeToken.decimals);

  //     const chainConfig = ETH_CHAIN_CONF[currentMarket.source];
  //     const contract = new Contract(chainConfig.contractAddress, chainConfig.contractInterface, api);

  //     if (depositAmount.gt(currentCollateral)) {
  //       sub$$ = from(api.getGasPrice())
  //         .pipe(
  //           switchMap((gasPrice) =>
  //             zip(
  //               of(gasPrice),
  //               from(
  //                 contract.estimateGas.deposit({
  //                   value: depositAmount.sub(currentCollateral),
  //                   gasPrice,
  //                 }) as Promise<BigNumber>
  //               )
  //             )
  //           )
  //         )
  //         .subscribe({
  //           next: ([gasPrice, gas]) => {
  //             setFeeEstimation(gas.mul(gasPrice));
  //           },
  //           error: (error) => {
  //             setFeeEstimation(null);
  //             console.error("estimate deposit:", error);
  //           },
  //         });
  //     } else if (depositAmount.lt(currentCollateral)) {
  //       sub$$ = from(api.getGasPrice())
  //         .pipe(
  //           switchMap((gasPrice) =>
  //             zip(
  //               of(gasPrice),
  //               from(
  //                 contract.estimateGas.withdraw(currentCollateral.sub(depositAmount), {
  //                   gasPrice,
  //                 }) as Promise<BigNumber>
  //               )
  //             )
  //           )
  //         )
  //         .subscribe({
  //           next: ([gasPrice, gas]) => {
  //             setFeeEstimation(gas.mul(gasPrice));
  //           },
  //           error: (error) => {
  //             setFeeEstimation(null);
  //             console.error("estimate withdraw:", error);
  //           },
  //         });
  //     }
  //   } else {
  //     setFeeEstimation(null);
  //   }

  //   return () => {
  //     if (sub$$) {
  //       sub$$.unsubscribe();
  //     }
  //   };
  // }, [deposit, api, currentMarket, currentCollateral]);

  return (
    <ModalEnhanced
      onCancel={onClose}
      onClose={onClose}
      cancelText={t(localeKeys.cancel)}
      confirmText={t(localeKeys.confirm)}
      onConfirm={handleConfirm}
      isVisible={isVisible}
      modalTitle={t(localeKeys.modifyCollateralBalance)}
    >
      <div className={"flex flex-col gap-[1.25rem]"}>
        {/*Your current balance*/}
        <div className={"flex flex-col gap-[0.625rem]"}>
          <div className={"text-12-bold"}>{t(localeKeys.yourCollateralBalance)}</div>
          <div className={"flex bg-divider rounded-[0.3125rem] h-[2.5rem] items-center justify-end px-[0.625rem]"}>
            <div className={"flex-1 text-14-bold"}>
              {formatBalance(currentCollateral, nativeToken?.decimals, undefined, { precision: BALANCE_DECIMALS })}
            </div>
            <div className={"flex-1 text-right text-14-bold"}>{nativeToken?.symbol}</div>
          </div>
        </div>

        {/*Your new balancce*/}
        <div className={"flex flex-col gap-[0.625rem]"}>
          <div className={"text-12-bold"}>
            <span>{t(localeKeys.youModifyBalanceTo)} </span>
            <span className="text-halfWhite">
              ({t(localeKeys.available)}{" "}
              {formatBalance(relayerBalance.available, nativeToken?.decimals, undefined, {
                precision: BALANCE_DECIMALS,
              })}
              )
            </span>
          </div>
          <Input
            value={collateralInput ?? ""}
            error={
              collteralTips?.text ? (
                <RenderInputTips text={collteralTips.text} error={collteralTips.error} />
              ) : undefined
            }
            leftIcon={null}
            className={"!text-14-bold"}
            onChange={handleCollateralChange}
            rightSlot={
              nativeToken?.symbol ? (
                <div className={"text-14-bold flex items-center px-[0.625rem]"}>{nativeToken.symbol}</div>
              ) : undefined
            }
          />
        </div>
        <div className={"bg-divider w-full h-[1px]"} />

        {fee && (
          <span className={"text-halfWhite text-12"}>
            {t(localeKeys.feeEstimation, {
              amount: formatBalance(fee, nativeToken?.decimals, nativeToken?.symbol, {
                precision: BALANCE_DECIMALS,
              }),
            })}
          </span>
        )}
      </div>
    </ModalEnhanced>
  );
};

const RenderInputTips = ({ text, error }: InputTips) => (
  <span className={`${error ? "text-danger" : "text-halfWhite"}`}>{text}</span>
);

export default ModifyCollateralBalanceModal;
