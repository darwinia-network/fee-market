import { Input, ModalEnhanced } from "@darwinia/ui";
import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import { ChangeEvent, useEffect, useState } from "react";

import { BigNumber, utils as ethersUtils } from "ethers";
import {} from "@feemarket/app-utils";
import { useFeeMarket, useApi } from "@feemarket/app-provider";
import { ETH_CHAIN_CONF, POLKADOT_CHAIN_CONF } from "@feemarket/app-config";
import type { FeeMarketSourceChainPolkadot, FeeMarketSourceChainEth } from "@feemarket/app-types";

export interface ModifyQuoteModalProps {
  isVisible: boolean;
  currentQuote: BigNumber;
  onClose: () => void;
}

const ModifyQuoteModal = ({ isVisible, currentQuote, onClose }: ModifyQuoteModalProps) => {
  const { t } = useTranslation();
  const { currentMarket } = useFeeMarket();
  const { api } = useApi();
  const [isModalVisible, setModalVisibility] = useState(false);
  const [quote, setQuote] = useState("");
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
    if (quote === "") {
      setQuoteError(generateError(t(localeKeys.quoteAmountLimitError, { amount: "15 RING" })));
      return;
    }
    console.log("quote====", quote);
    onCloseModal();
  };

  const onQuoteChanged = (e: ChangeEvent<HTMLInputElement>) => {
    setQuoteError(null);
    const value = e.target.value;
    setQuote(value);
  };

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

        <div className={"flex flex-col gap-[0.625rem]"}>{t(localeKeys.feeEstimation, { amount: "0.12551 RING" })}</div>
      </div>
    </ModalEnhanced>
  );
};

const generateError = (error: string) => {
  return <div>{error}</div>;
};

export default ModifyQuoteModal;
