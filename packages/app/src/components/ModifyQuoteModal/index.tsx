import { Input, ModalEnhanced } from "@darwinia/ui";
import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import { ChangeEvent, useEffect, useState, useMemo, useCallback } from "react";
import { BigNumber, utils as ethersUtils } from "ethers";
import { isEthChain, isPolkadotChain, formatBalance, getEthChainConfig, getPolkadotChainConfig } from "../../utils";
import type { BN } from "@polkadot/util";
import { useRelayer, useApi, useMarket } from "../../hooks";
import { parseUnits } from "viem";

interface InputTips {
  text: string;
  error?: boolean;
}

const ModifyQuoteModal = ({ isVisible, onClose }: { isVisible: boolean; onClose: () => void }) => {
  const { t } = useTranslation();
  const { currentMarket, sourceChain } = useMarket();
  const { signerApi: api } = useApi();
  const { relayerAddress, minQuote, currentQuoteAmount, updateQuote, getRelayerInfo } = useRelayer();

  const [busy, setBusy] = useState(false);
  const [fee] = useState<BigNumber | BN | null>(null);

  const [quoteTips, setQuoteTips] = useState<InputTips | null>(null);
  const [quoteInput, setQuoteInput] = useState<string | undefined>();

  const loadingModal = useMemo(() => {
    return !relayerAddress || !currentMarket || !api || minQuote === null;
  }, [relayerAddress, currentMarket, api, minQuote]);

  const disableConfirm = useMemo(() => {
    return !quoteInput || quoteTips?.error;
  }, [quoteInput, quoteTips]);

  const nativeToken = useMemo(() => {
    if (isEthChain(sourceChain)) {
      return getEthChainConfig(sourceChain).nativeToken;
    } else if (isPolkadotChain(sourceChain)) {
      return getPolkadotChainConfig(sourceChain).nativeToken;
    }
    return null;
  }, [sourceChain]);

  const handleQuoteChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;

      if (Number.isNaN(Number(value)) || Number(value) < 0) {
        return;
      }

      setQuoteInput(value);
      setQuoteTips((previous) => (previous ? { ...previous, error: false } : null));

      if (nativeToken && minQuote) {
        const min = BigNumber.from(minQuote.toString());
        const input = ethersUtils.parseUnits(value || "0", nativeToken.decimals);

        if (input.lt(min)) {
          setQuoteTips((previous) => ({ text: previous?.text ?? "", error: true }));
        }
      }
    },
    [nativeToken, minQuote]
  );

  const handleConfirm = useCallback(async () => {
    if (quoteTips?.error === false && quoteInput && nativeToken) {
      const inputAmount = parseUnits(`${Number(quoteInput)}`, nativeToken.decimals);

      setBusy(true);
      updateQuote(
        inputAmount,
        () => {
          setBusy(false);
        },
        () => {
          getRelayerInfo();
          setBusy(false);
          onClose();
        }
      );
    }
  }, [quoteTips, quoteInput, nativeToken, onClose, updateQuote, getRelayerInfo]);

  // Quote input tips
  useEffect(() => {
    if (nativeToken && minQuote !== null) {
      const min = BigNumber.from(minQuote.toString());
      setQuoteTips({
        error: false,
        text: t(localeKeys.quoteAmountLimitError, {
          amount: formatBalance(min, nativeToken.decimals, nativeToken.symbol),
        }),
      });
    }

    return () => {
      setQuoteTips(null);
    };
  }, [t, nativeToken, minQuote]);

  // Estimate fee
  // useEffect(() => {
  //   let sub$$: Subscription;
  //   if (quote !== null) {
  //     return;
  //   }

  //   if (currentMarket?.source && isEthChain(currentMarket.source) && isEthApi(api) && nativeToken?.decimals && quote) {
  //     const quoteAmount = ethersUtils.parseUnits(quote, nativeToken.decimals);

  //     const chainConfig = ETH_CHAIN_CONF[currentMarket.source];
  //     const contract = new Contract(chainConfig.contractAddress, chainConfig.contractInterface, api);

  //     sub$$ = from(contract.relayerCount() as Promise<BigNumber>)
  //       .pipe(
  //         switchMap((relayerCount) =>
  //           zip(
  //             from(api.getGasPrice()),
  //             forkJoin(
  //               new Array(relayerCount.toNumber())
  //                 .fill(0)
  //                 .map(
  //                   (_, index) =>
  //                     contract.getOrderBook(index + 1, true) as Promise<
  //                       [BigNumber, string[], BigNumber[], BigNumber[], BigNumber[]]
  //                     >
  //                 )
  //             )
  //           )
  //         ),
  //         switchMap(([gasPrice, book]) => {
  //           const oldIndex = book.findIndex((item) => item[1].some((item) => item === relayerAddress));
  //           let oldPrev: string | null = null;
  //           if (oldIndex === 0) {
  //             oldPrev = SENTINEL_HEAD;
  //           } else if (oldIndex > 0) {
  //             oldPrev = book[oldIndex - 1][1][0];
  //           }

  //           let newIndex = -1;
  //           for (let i = 0; i < book.length; i++) {
  //             if (quoteAmount.gt(book[i][2][0])) {
  //               newIndex = i;
  //               break;
  //             }
  //           }
  //           const newPrev = newIndex === -1 ? SENTINEL_HEAD : book[newIndex][1][0];

  //           return zip(
  //             of(gasPrice),
  //             from(
  //               contract.estimateGas.move(oldPrev, newPrev, quoteAmount, {
  //                 gasPrice,
  //               }) as Promise<BigNumber>
  //             )
  //           );
  //         })
  //       )
  //       .subscribe({
  //         next: ([gasPrice, gas]) => {
  //           setFeeEstimation(gas.mul(gasPrice));
  //         },
  //         error: (error) => {
  //           setFeeEstimation(null);
  //           console.error("estimate move:", error);
  //         },
  //       });
  //   } else {
  //     setFeeEstimation(null);
  //   }

  //   return () => {
  //     if (sub$$) {
  //       sub$$.unsubscribe();
  //     }
  //   };
  // }, [quote, api, currentMarket]);

  return (
    <ModalEnhanced
      onCancel={onClose}
      onClose={onClose}
      cancelText={t(localeKeys.cancel)}
      confirmText={t(localeKeys.confirm)}
      onConfirm={handleConfirm}
      isVisible={isVisible}
      isLoading={loadingModal}
      confirmLoading={busy}
      confirmDisabled={disableConfirm}
      modalTitle={t(localeKeys.modifyYourQuote)}
    >
      <div className={"flex flex-col gap-[1.25rem]"}>
        {/*Your current quote*/}
        <div className={"flex flex-col gap-[0.625rem]"}>
          <div className={"text-12-bold"}>{t(localeKeys.yourCurrentQuote)}</div>
          <div className={"flex bg-divider rounded-[0.3125rem] h-[2.5rem] items-center justify-end px-[0.625rem]"}>
            {nativeToken && (
              <div className={"flex-1 text-14-bold"}>
                {formatBalance(currentQuoteAmount, nativeToken.decimals, undefined)}
              </div>
            )}
            {nativeToken?.symbol ? (
              <span className={"flex-1 text-right text-14-bold"}>
                {t(localeKeys.perOrder, { currency: nativeToken.symbol })}
              </span>
            ) : null}
          </div>
        </div>

        {/*Your new quote*/}
        <div className={"flex flex-col gap-[0.625rem]"}>
          <div className={"text-12-bold"}>{t(localeKeys.youModifyQuoteTo)}</div>
          <Input
            value={quoteInput ?? ""}
            error={quoteTips?.error ? <RenderInputTips text={quoteTips.text} error={quoteTips.error} /> : null}
            bottomTip={quoteTips?.error ? null : <RenderInputTips text={quoteTips?.text ?? ""} error={false} />}
            leftIcon={null}
            className={"!text-14-bold"}
            onChange={handleQuoteChange}
            rightSlot={
              nativeToken?.symbol ? (
                <div className={"text-14-bold flex items-center px-[0.625rem]"}>
                  {t(localeKeys.perOrder, { currency: nativeToken.symbol })}
                </div>
              ) : undefined
            }
          />
        </div>
        <div className={"bg-divider w-full h-[1px]"} />

        {fee && nativeToken ? (
          <span className={"text-halfWhite text-12"}>
            {t(localeKeys.feeEstimation, {
              amount: formatBalance(fee, nativeToken.decimals, nativeToken.symbol),
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

export default ModifyQuoteModal;
