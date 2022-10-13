import { Input, ModalEnhanced } from "@darwinia/ui";
import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import { ChangeEvent, useEffect, useState, useMemo, useCallback } from "react";
import { BigNumber, utils as ethersUtils, Contract } from "ethers";
import {
  isEthApi,
  isPolkadotApi,
  isEthChain,
  isPolkadotChain,
  signAndSendTx,
  triggerContract,
  formatBalance,
  getQuotePrev,
  getFeeMarketApiSection,
  CallbackType,
} from "@feemarket/app-utils";
import { useFeeMarket, useApi } from "@feemarket/app-provider";
import { ETH_CHAIN_CONF, POLKADOT_CHAIN_CONF, BALANCE_DECIMALS } from "@feemarket/app-config";
import type { FeeMarketSourceChainPolkadot, FeeMarketSourceChainEth } from "@feemarket/app-types";
import type { BN } from "@polkadot/util";
import type { u128 } from "@polkadot/types";

interface InputTips {
  text: string;
  error?: boolean;
}

interface Props {
  isVisible: boolean;
  currentQuote: BigNumber | BN;
  relayerAddress: string;
  onClose: () => void;
}

const ModifyQuoteModal = ({ isVisible, currentQuote, relayerAddress, onClose }: Props) => {
  const { t } = useTranslation();
  const { currentMarket } = useFeeMarket();
  const { api } = useApi();

  const [fee] = useState<BigNumber | BN | null>(null);

  const [minQuote, setMinQuote] = useState<BN | BigNumber | null>(null);
  const [quoteTips, setQuoteTips] = useState<InputTips | null>(null);
  const [quoteInput, setQuoteInput] = useState<string | undefined>();

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
    [t, nativeToken, minQuote]
  );

  const handleConfirm = useCallback(async () => {
    if (quoteTips?.error === false && quoteInput && nativeToken && relayerAddress && currentQuote) {
      const inputAmount = ethersUtils.parseUnits(quoteInput, nativeToken.decimals);
      const currentAmount = BigNumber.from(currentQuote.toString());

      if (isEthChain(sourceChain) && isEthApi(api)) {
        const chainConfig = ETH_CHAIN_CONF[sourceChain];
        const contract = new Contract(chainConfig.contractAddress, chainConfig.contractInterface, api.getSigner());

        const { prevOld, prevNew } = await getQuotePrev(contract, relayerAddress, currentAmount);

        const callback: CallbackType = {
          errorCallback: ({ error }) => {
            console.error("update quote:", error);
          },
          responseCallback: ({ response }) => {
            onClose();
            console.log("update quote response:", response);
          },
          successCallback: ({ receipt }) => {
            console.log("update quote receipt:", receipt);
          },
        };

        triggerContract(contract, "move", [prevOld, prevNew, inputAmount], callback);
      } else if (isPolkadotChain(destinationChain) && isPolkadotApi(api)) {
        const apiSection = getFeeMarketApiSection(api, destinationChain);
        if (apiSection) {
          const extrinsic = api.tx[apiSection].updateRelayFee(inputAmount.toString());

          signAndSendTx({
            extrinsic,
            requireAddress: relayerAddress,
            txUpdateCb: onClose,
            txFailedCb: (error) => console.error(error),
          });
        }
      }
    }
  }, [quoteTips, quoteInput, nativeToken, relayerAddress, currentQuote, sourceChain, destinationChain]);

  // Get minQuote
  useEffect(() => {
    if (isEthChain(sourceChain) && isEthApi(api)) {
      setMinQuote(BigNumber.from(0));
    } else if (isPolkadotChain(destinationChain) && isPolkadotApi(api)) {
      const apiSection = getFeeMarketApiSection(api, destinationChain);
      if (apiSection) {
        setMinQuote(api.consts[apiSection].minimumRelayFee as u128);
      }
    }

    return () => {
      setMinQuote(null);
    };
  }, [sourceChain, destinationChain, api]);

  // Quote input tips
  useEffect(() => {
    if (nativeToken && minQuote) {
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
      modalTitle={t(localeKeys.modifyYourQuote)}
    >
      <div className={"flex flex-col gap-[1.25rem]"}>
        {/*Your current quote*/}
        <div className={"flex flex-col gap-[0.625rem]"}>
          <div className={"text-12-bold"}>{t(localeKeys.yourCurrentQuote)}</div>
          <div className={"flex bg-divider rounded-[0.3125rem] h-[2.5rem] items-center justify-end px-[0.625rem]"}>
            <div className={"flex-1 text-14-bold"}>
              {formatBalance(currentQuote, nativeToken?.decimals, undefined, { precision: BALANCE_DECIMALS })}
            </div>
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
            error={quoteTips?.text ? <RenderInputTips text={quoteTips.text} error={quoteTips.error} /> : undefined}
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

export default ModifyQuoteModal;
