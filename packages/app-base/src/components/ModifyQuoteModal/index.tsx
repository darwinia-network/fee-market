import { Input, ModalEnhanced } from "@darwinia/ui";
import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import { ChangeEvent, useEffect, useState } from "react";

import { BigNumber, utils as ethersUtils, Contract } from "ethers";
import {
  isEthApi,
  isPolkadotApi,
  isEthChain,
  isPolkadotChain,
  triggerContract,
  formatBalance,
  getFeeMarketApiSection,
} from "@feemarket/app-utils";
import { useFeeMarket, useApi } from "@feemarket/app-provider";
import { ETH_CHAIN_CONF, POLKADOT_CHAIN_CONF, BALANCE_DECIMALS } from "@feemarket/app-config";
import type { FeeMarketSourceChainPolkadot, FeeMarketSourceChainEth } from "@feemarket/app-types";
import { from, switchMap, forkJoin, Subscription, zip, of } from "rxjs";
import { web3FromAddress } from "@polkadot/extension-dapp";

const SENTINEL_HEAD = "0x0000000000000000000000000000000000000001";
// const SENTINEL_HEAD = '0000000000000000000000000000000000000000000000000000000000000001';
// const SENTINEL_TAIL = '0x02';

export interface ModifyQuoteModalProps {
  isVisible: boolean;
  currentQuote: BigNumber;
  relayerAddress: string;
  onClose: () => void;
}

const ModifyQuoteModal = ({ isVisible, currentQuote, relayerAddress, onClose }: ModifyQuoteModalProps) => {
  const { t } = useTranslation();
  const { currentMarket } = useFeeMarket();
  const { api } = useApi();
  const [isModalVisible, setModalVisibility] = useState(false);
  const [quote, setQuote] = useState("");
  const [feeEstimation, setFeeEstimation] = useState<BigNumber | null>(null);
  const [quoteError, setQuoteError] = useState<JSX.Element | null>(null);

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
    if (currentMarket?.source && isEthChain(currentMarket.source) && isEthApi(api) && quote && relayerAddress) {
      if (Number(quote) <= 0) {
        setQuoteError(
          generateError(t(localeKeys.quoteAmountLimitError, { amount: `0 ${nativeToken?.symbol ?? "-"}` }))
        );
        return;
      }
      const quoteAmount = ethersUtils.parseUnits(quote, nativeToken.decimals);

      const chainConfig = ETH_CHAIN_CONF[currentMarket.source];
      const contract = new Contract(chainConfig.contractAddress, chainConfig.contractInterface, api.getSigner());

      from(contract.relayerCount() as Promise<BigNumber>)
        .pipe(
          switchMap((relayerCount) =>
            forkJoin(
              new Array(relayerCount.toNumber())
                .fill(0)
                .map(
                  (_, index) =>
                    contract.getOrderBook(index + 1, true) as Promise<
                      [BigNumber, string[], BigNumber[], BigNumber[], BigNumber[]]
                    >
                )
            )
          )
        )
        .subscribe({
          next: (book) => {
            const oldIndex = book.findIndex((item) => item[1].some((item) => item === relayerAddress));
            let oldPrev: string | null = null;
            if (oldIndex === 0) {
              oldPrev = SENTINEL_HEAD;
            } else if (oldIndex > 0) {
              oldPrev = book[oldIndex - 1][1][0];
            }

            let newIndex = -1;
            for (let i = 0; i < book.length; i++) {
              if (quoteAmount.gt(book[i][2][0])) {
                newIndex = i;
                break;
              }
            }
            const newPrev = newIndex === -1 ? SENTINEL_HEAD : book[newIndex][1][0];

            console.log("book:", book);
            console.log("move prev:", oldPrev, newPrev);

            triggerContract(contract, "move", [oldPrev, newPrev, quoteAmount], {
              errorCallback: ({ error }) => {
                console.error("call move:", error);
              },
              responseCallback: ({ response }) => {
                onCloseModal();
                console.log("call move response:", response);
              },
              successCallback: ({ receipt }) => {
                console.log("call move receipt:", receipt);
              },
            });
          },
          error: (error) => {
            console.error("get all relayers:", error);
          },
        });
    } else if (
      currentMarket?.destination &&
      isPolkadotChain(currentMarket.destination) &&
      isPolkadotApi(api) &&
      quote
    ) {
      if (Number(quote) <= 0) {
        setQuoteError(
          generateError(t(localeKeys.quoteAmountLimitError, { amount: `0 ${nativeToken?.symbol ?? "-"}` }))
        );
        return;
      }

      const apiSection = getFeeMarketApiSection(api, currentMarket.destination);
      if (apiSection) {
        const quoteAmount = ethersUtils.parseUnits(quote, nativeToken.decimals);
        const extrinsic = api.tx[apiSection].updateRelayFee(quoteAmount.toString());

        from(web3FromAddress(relayerAddress))
          .pipe(switchMap((injector) => from(extrinsic.signAndSend(relayerAddress, { signer: injector.signer }))))
          .subscribe({
            next: (result) => {
              console.log("sign and send quote update:", result.toString());
            },
            error: (error) => {
              onCloseModal();
              console.error("sign and send quote uodate:", error);
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

  const onQuoteChanged = (e: ChangeEvent<HTMLInputElement>) => {
    setQuoteError(null);
    const value = e.target.value;
    setQuote(value);
  };

  // Estimate fee
  // useEffect(() => {
  //   let sub$$: Subscription;

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
      onCancel={onCancelModal}
      onClose={onCloseModal}
      cancelText={t(localeKeys.cancel)}
      confirmText={t(localeKeys.confirm)}
      onConfirm={onModifyQuote}
      isVisible={isModalVisible}
      modalTitle={t(localeKeys.modifyYourQuote)}
    >
      <div className={"flex flex-col gap-[1.25rem]"}>
        {/*Your current quote*/}
        <div className={"flex flex-col gap-[0.625rem]"}>
          <div className={"text-12-bold"}>{t(localeKeys.yourCurrentQuote)}</div>
          <div className={"flex bg-divider rounded-[0.3125rem] h-[2.5rem] items-center justify-end px-[0.625rem]"}>
            <div className={"flex-1 text-14-bold"}>
              {ethersUtils.commify(ethersUtils.formatUnits(currentQuote, nativeToken?.decimals))}
            </div>
            <div className={"flex-1 text-right text-14-bold"}>
              {t(localeKeys.perOrder, { currency: nativeToken?.symbol ?? "-" })}
            </div>
          </div>
        </div>

        {/*Your new quote*/}
        <div className={"flex flex-col gap-[0.625rem]"}>
          <div className={"text-12-bold"}>{t(localeKeys.youModifyQuoteTo)}</div>
          <Input
            value={quote}
            error={quoteError}
            leftIcon={null}
            className={"!text-14-bold"}
            onChange={onQuoteChanged}
            rightSlot={
              <div className={"text-14-bold flex items-center px-[0.625rem]"}>
                {t(localeKeys.perOrder, { currency: nativeToken?.symbol ?? "-" })}
              </div>
            }
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

export default ModifyQuoteModal;
