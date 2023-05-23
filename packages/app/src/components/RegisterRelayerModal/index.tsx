import { Input, ModalEnhanced } from "@darwinia/ui";
import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import AccountMini from "../AccountMini";
import { BigNumber, utils as ethersUtils } from "ethers";
import { parseUnits } from "viem";
import { isEthChain, isPolkadotChain, formatBalance, getEthChainConfig, getPolkadotChainConfig } from "../../utils";
import { useRelayer, useApi, useBalance, useMarket } from "../../hooks";

interface InputTips {
  text: string;
  error?: boolean;
}

const RegisterRelayerModal = ({ isVisible, onClose }: { isVisible: boolean; onClose: () => void }) => {
  const { t } = useTranslation();
  const { currentMarket, sourceChain } = useMarket();
  const { signerApi: api } = useApi();
  const { relayerAddress, minQuote, minCollateral, register, getRelayerInfo } = useRelayer();
  const { balance: relayerBalance, refresh: refreshBalance } = useBalance(relayerAddress);

  const [busy, setBusy] = useState(false);

  const [quoteInput, setQuoteInput] = useState<string | undefined>();
  const [collateralInput, setCollateralInput] = useState<string | undefined>();

  const [quoteTips, setQuoteTips] = useState<InputTips | null>(null);
  const [collteralTips, setCollateralTips] = useState<InputTips | null>(null);

  const loadingModal = useMemo(() => {
    return !relayerAddress || !currentMarket || !api || !relayerBalance || minQuote === null || !minCollateral;
  }, [relayerAddress, currentMarket, api, relayerBalance, minQuote, minCollateral]);

  const disableConfirm = useMemo(() => {
    return !quoteInput || !collateralInput || quoteTips?.error || collteralTips?.error;
  }, [quoteInput, collateralInput, quoteTips, collteralTips]);

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
    if (quoteTips?.error === false && collteralTips?.error === false && quoteInput && collateralInput && nativeToken) {
      const quoteAmount = parseUnits(`${Number(quoteInput)}`, nativeToken.decimals);
      const collateralAmount = parseUnits(`${Number(collateralInput)}`, nativeToken.decimals);

      setBusy(true);
      register(
        quoteAmount,
        collateralAmount,
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
  }, [
    quoteTips,
    collteralTips,
    quoteInput,
    collateralInput,
    nativeToken,
    onClose,
    refreshBalance,
    register,
    getRelayerInfo,
  ]);

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
            {relayerBalance.available && nativeToken ? (
              <span className="text-halfWhite">
                ({t(localeKeys.available)} {formatBalance(relayerBalance.available, nativeToken.decimals, undefined)})
              </span>
            ) : null}
          </div>
          <Input
            value={collateralInput || ""}
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

        {/*Your quote*/}
        <div className={"flex flex-col gap-[0.625rem]"}>
          <div className={"text-12-bold"}>{t(localeKeys.youQuote)}</div>
          <Input
            value={quoteInput || ""}
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
      </div>
    </ModalEnhanced>
  );
};

const RenderInputTips = ({ text, error }: InputTips) => (
  <span className={`${error ? "text-danger" : "text-halfWhite"}`}>{text}</span>
);

export default RegisterRelayerModal;
