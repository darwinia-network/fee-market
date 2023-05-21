import { Input, ModalEnhanced } from "@darwinia/ui";
import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import { ChangeEvent, useEffect, useState, useMemo, useCallback } from "react";
import { formatBalance, isEthChain, isPolkadotChain, getPolkadotChainConfig, getEthChainConfig } from "../../utils";
import { BigNumber, utils as ethersUtils } from "ethers";
import { useBalance, useApi, useMarket } from "../../hooks";
import type { BN } from "@polkadot/util";
import { useRelayer } from "../../hooks";
import { parseUnits } from "viem";

interface InputTips {
  text: string;
  error?: boolean;
}

const ModifyCollateralBalanceModal = ({ isVisible, onClose }: { isVisible: boolean; onClose: () => void }) => {
  const { t } = useTranslation();
  const { currentMarket, sourceChain } = useMarket();
  const { signerApi: api } = useApi();
  const { relayerAddress, minCollateral, collateralAmount, updateCollateral, getRelayerInfo } = useRelayer();
  const { balance: relayerBalance, refresh: refreshBalance } = useBalance(relayerAddress);

  const [busy, setBusy] = useState(false);
  const [fee] = useState<BigNumber | BN | null>(null);

  const [collteralTips, setCollateralTips] = useState<InputTips | null>(null);
  const [collateralInput, setCollateralInput] = useState<string | undefined>();

  const loadingModal = useMemo(() => {
    return !currentMarket || !relayerBalance || !minCollateral || !api;
  }, [currentMarket, api, relayerBalance, minCollateral]);

  const disableConfirm = useMemo(() => {
    return !collateralInput || collteralTips?.error;
  }, [collateralInput, collteralTips]);

  const nativeToken = useMemo(() => {
    if (isEthChain(sourceChain)) {
      return getEthChainConfig(sourceChain).nativeToken;
    } else if (isPolkadotChain(sourceChain)) {
      return getPolkadotChainConfig(sourceChain).nativeToken;
    }
    return null;
  }, [sourceChain]);

  const handleCollateralChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;

      if (Number.isNaN(Number(value)) || Number(value) < 0) {
        return;
      }

      setCollateralInput(value);
      setCollateralTips((previous) => (previous ? { ...previous, error: false } : null));

      if (nativeToken && minCollateral && relayerBalance.available) {
        const min = BigNumber.from(minCollateral.toString());
        const available = BigNumber.from(relayerBalance.available.toString());
        const input = ethersUtils.parseUnits(value || "0", nativeToken.decimals);
        const current = BigNumber.from(collateralAmount.toString());

        if (input.gt(current) && input.sub(current).gt(available)) {
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
    [t, nativeToken, minCollateral, relayerBalance.available, collateralAmount]
  );

  const handleConfirm = useCallback(() => {
    if (collteralTips?.error === false && collateralInput && nativeToken) {
      const inputAmount = parseUnits(`${Number(collateralInput)}`, nativeToken.decimals);

      setBusy(true);
      updateCollateral(
        inputAmount,
        () => {
          setBusy(false);
        },
        () => {
          refreshBalance();
          getRelayerInfo();
          setBusy(false);
          onClose();
        }
      );
    }
  }, [collteralTips, collateralInput, nativeToken, onClose, refreshBalance, updateCollateral, getRelayerInfo]);

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
      confirmLoading={busy}
      confirmDisabled={disableConfirm}
      isLoading={loadingModal}
      modalTitle={t(localeKeys.modifyCollateralBalance)}
    >
      <div className={"flex flex-col gap-[1.25rem]"}>
        {/*Your current balance*/}
        <div className={"flex flex-col gap-[0.625rem]"}>
          <div className={"text-12-bold"}>{t(localeKeys.yourCollateralBalance)}</div>
          <div className={"flex bg-divider rounded-[0.3125rem] h-[2.5rem] items-center justify-end px-[0.625rem]"}>
            {nativeToken && (
              <div className={"flex-1 text-14-bold"}>
                {formatBalance(collateralAmount, nativeToken.decimals, undefined)}
              </div>
            )}
            <div className={"flex-1 text-right text-14-bold"}>{nativeToken?.symbol}</div>
          </div>
        </div>

        {/*Your new balancce*/}
        <div className={"flex flex-col gap-[0.625rem]"}>
          <div className={"text-12-bold"}>
            <span>{t(localeKeys.youModifyBalanceTo)} </span>
            {relayerBalance.available && nativeToken ? (
              <span className="text-halfWhite">
                ({t(localeKeys.available)} {formatBalance(relayerBalance.available, nativeToken.decimals, undefined)})
              </span>
            ) : null}
          </div>
          <Input
            value={collateralInput ?? ""}
            error={
              collteralTips?.error ? <RenderInputTips text={collteralTips.text} error={collteralTips.error} /> : null
            }
            bottomTip={collteralTips?.error ? null : <RenderInputTips text={collteralTips?.text ?? ""} error={false} />}
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

        {fee && nativeToken ? (
          <span className={"text-halfWhite text-12"}>
            {t(localeKeys.feeEstimation, {
              amount: formatBalance(fee, nativeToken?.decimals, nativeToken?.symbol),
            })}
          </span>
        ) : null}
      </div>
    </ModalEnhanced>
  );
};

const RenderInputTips = ({ text, error }: InputTips) => (
  <span className={`${error ? "text-danger" : "text-halfWhite"}`}>{text}</span>
);

export default ModifyCollateralBalanceModal;
