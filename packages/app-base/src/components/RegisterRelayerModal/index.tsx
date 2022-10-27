import { Input, ModalEnhanced, notification } from "@darwinia/ui";
import { useTranslation, TFunction } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import AccountMini from "../AccountMini";
import { BigNumber, utils as ethersUtils, Contract } from "ethers";
import {
  isEthApi,
  isPolkadotApi,
  isEthChain,
  isPolkadotChain,
  signAndSendTx,
  triggerContract,
  getQuotePrev,
  getFeeMarketApiSection,
  formatBalance,
  CallbackType,
} from "@feemarket/app-utils";
import { useFeeMarket, useApi } from "@feemarket/app-provider";
import { ETH_CHAIN_CONF, POLKADOT_CHAIN_CONF } from "@feemarket/app-config";
import type { FeeMarketSourceChainPolkadot, FeeMarketSourceChainEth } from "@feemarket/app-types";
import { from, of, zip, Subscription } from "rxjs";
import { BN } from "@polkadot/util";
import { useBalance } from "@feemarket/app-hooks";
import type { u128 } from "@polkadot/types";

interface InputTips {
  text: string;
  error?: boolean;
}

const notifyTx = (
  t: TFunction,
  {
    type,
    msg,
    hash,
    explorer,
  }: {
    type: "error" | "success";
    msg?: string;
    hash?: string;
    explorer?: string;
  }
) => {
  notification[type]({
    message: (
      <div className="flex flex-col gap-1.5">
        <h5 className="capitalize text-14-bold">
          {type === "success" ? t(localeKeys.successed) : t(localeKeys.failed)}
        </h5>
        {hash && explorer ? (
          <a
            className="text-12 underline text-primary break-all hover:opacity-80"
            rel="noopener noreferrer"
            target={"_blank"}
            href={`${explorer}tx/${hash}`}
          >
            {hash}
          </a>
        ) : (
          <p className="text-12 break-all">{msg}</p>
        )}
      </div>
    ),
  });
};

export interface Props {
  isVisible: boolean;
  relayerAddress: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const RegisterRelayerModal = ({ isVisible, relayerAddress, onClose, onSuccess = () => undefined }: Props) => {
  const { t } = useTranslation();
  const { currentMarket } = useFeeMarket();
  const { signerApi: api } = useApi();
  const { balance: relayerBalance, refresh: refreshBalance } = useBalance(api, relayerAddress);

  const [busy, setBusy] = useState(false);

  const [quoteInput, setQuoteInput] = useState<string | undefined>();
  const [collateralInput, setCollateralInput] = useState<string | undefined>();

  const [quoteTips, setQuoteTips] = useState<InputTips | null>(null);
  const [collteralTips, setCollateralTips] = useState<InputTips | null>(null);

  const [minQuote, setMinQuote] = useState<BN | BigNumber | null>(null);
  const [minCollateral, setMinCollateral] = useState<BN | BigNumber | null>(null);

  const sourceChain = currentMarket?.source;
  const destinationChain = currentMarket?.destination;

  const loadingModal = useMemo(() => {
    return !relayerAddress || !currentMarket || !api || !relayerBalance || !minQuote || !minCollateral;
  }, [relayerAddress, currentMarket, api, relayerBalance, minQuote, minCollateral]);

  const disableConfirm = useMemo(() => {
    return !quoteInput || !collateralInput || quoteTips?.error || collteralTips?.error;
  }, [quoteInput, collateralInput, quoteTips, collteralTips]);

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

  const handleConfirm = useCallback(async () => {
    if (
      quoteTips?.error === false &&
      collteralTips?.error === false &&
      quoteInput &&
      collateralInput &&
      nativeToken &&
      relayerAddress
    ) {
      const quoteAmount = ethersUtils.parseUnits(quoteInput, nativeToken.decimals);
      const collateralAmount = ethersUtils.parseUnits(collateralInput, nativeToken.decimals);

      if (isEthChain(sourceChain) && isEthApi(api)) {
        setBusy(true);

        const chainConfig = ETH_CHAIN_CONF[sourceChain];
        const contract = new Contract(chainConfig.contractAddress, chainConfig.contractInterface, api.getSigner());

        const { prevNew } = await getQuotePrev(contract, relayerAddress, quoteAmount);

        const callback: CallbackType = {
          errorCallback: ({ error }) => {
            if (error instanceof Error) {
              notifyTx(t, {
                type: "error",
                msg: error.message,
              });
            } else {
              notifyTx(t, {
                type: "error",
                msg: t("Transaction sending failed"),
              });
            }
            setBusy(false);
            console.error("Call enroll:", error);
          },
          responseCallback: ({ response }) => {
            console.log("Call enroll response:", response);
          },
          successCallback: ({ receipt }) => {
            notifyTx(t, {
              type: "success",
              explorer: chainConfig.explorer.url,
              hash: receipt.transactionHash,
            });
            onClose();
            onSuccess();
            refreshBalance();
            setBusy(false);
            console.log("Call enroll receipt:", receipt);
          },
        };

        triggerContract(contract, "enroll", [prevNew, quoteAmount], callback, { value: collateralAmount.toString() });
      } else if (isPolkadotChain(sourceChain) && isPolkadotChain(destinationChain) && isPolkadotApi(api)) {
        const chainConfig = POLKADOT_CHAIN_CONF[sourceChain];
        const apiSection = getFeeMarketApiSection(api, destinationChain);

        if (apiSection) {
          setBusy(true);

          const extrinsic = api.tx[apiSection].enrollAndLockCollateral(
            collateralAmount.toString(),
            quoteAmount.toString()
          );

          signAndSendTx({
            extrinsic,
            requireAddress: relayerAddress,
            txSuccessCb: (result) => {
              notifyTx(t, {
                type: "success",
                explorer: chainConfig.explorer.url,
                hash: result.txHash.toHex(),
              });
              onClose();
              onSuccess();
              refreshBalance();
              setBusy(false);
            },
            txFailedCb: (error) => {
              if (error) {
                if (error instanceof Error) {
                  notifyTx(t, { type: "error", msg: error.message });
                } else {
                  notifyTx(t, { type: "error", explorer: chainConfig.explorer.url, hash: error.txHash.toHex() });
                }
              } else {
                notifyTx(t, { type: "error", msg: t("Transaction sending failed") });
              }
              setBusy(false);
              console.error(error);
            },
          });
        }
      }
    }
  }, [
    quoteTips,
    collteralTips,
    quoteInput,
    collateralInput,
    sourceChain,
    destinationChain,
    api,
    nativeToken,
    relayerAddress,
    onSuccess,
    refreshBalance,
  ]);

  // Get minQuote and minCollateral
  useEffect(() => {
    let sub$$: Subscription;

    if (isEthChain(sourceChain) && isEthApi(api)) {
      const chainConfig = ETH_CHAIN_CONF[sourceChain];
      const contract = new Contract(chainConfig.contractAddress, chainConfig.contractInterface, api);

      sub$$ = zip(of(BigNumber.from(0)), from(contract.COLLATERAL_PER_ORDER() as Promise<BigNumber>)).subscribe({
        next: ([quote, collateral]) => {
          setMinQuote(quote);
          setMinCollateral(collateral);
        },
        error: (error) => {
          console.log("Get minQuote and minCollateral:", error);
        },
      });
    } else if (isPolkadotChain(destinationChain) && isPolkadotApi(api)) {
      const apiSection = getFeeMarketApiSection(api, destinationChain);

      if (apiSection) {
        sub$$ = zip(
          of(api.consts[apiSection].minimumRelayFee as u128),
          of(api.consts[apiSection].collateralPerOrder as u128)
        ).subscribe({
          next: ([quote, collateral]) => {
            setMinQuote(quote);
            setMinCollateral(collateral);
          },
          error: (error) => {
            console.log("Get minQuote and minCollateral:", error);
          },
        });
      }
    }

    return () => {
      if (sub$$) {
        sub$$.unsubscribe();
      }
      setMinQuote(null);
      setMinCollateral(null);
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

  return (
    <ModalEnhanced
      onCancel={onClose}
      onClose={onClose}
      cancelText={t(localeKeys.cancel)}
      confirmText={t(localeKeys.register)}
      onConfirm={handleConfirm}
      isVisible={isVisible}
      isLoading={loadingModal}
      confirmDisabled={disableConfirm}
      confirmLoading={busy}
      modalTitle={t(localeKeys.registerRelayer)}
    >
      <div className={"flex flex-col gap-[1.25rem]"}>
        <div className={"flex flex-col gap-[0.625rem]"}>
          <div className={"text-12-bold"}>{t(localeKeys.account)}</div>
          <AccountMini address={relayerAddress} />
        </div>
        {/*Deposit guarantee*/}
        <div className={"flex flex-col gap-[0.625rem]"}>
          <div className={"text-12-bold"}>
            <span>{t(localeKeys.youDeposit)} </span>
            <span className="text-halfWhite">
              ({t(localeKeys.available)} {formatBalance(relayerBalance.available, nativeToken?.decimals, undefined)})
            </span>
          </div>
          <Input
            value={collateralInput || ""}
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

        {/*Your quote*/}
        <div className={"flex flex-col gap-[0.625rem]"}>
          <div className={"text-12-bold"}>{t(localeKeys.youQuote)}</div>
          <Input
            value={quoteInput || ""}
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
      </div>
    </ModalEnhanced>
  );
};

const RenderInputTips = ({ text, error }: InputTips) => (
  <span className={`${error ? "text-danger" : "text-halfWhite"}`}>{text}</span>
);

export default RegisterRelayerModal;
