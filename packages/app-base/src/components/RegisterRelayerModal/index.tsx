import { Input, ModalEnhanced } from "@darwinia/ui";
import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import { ChangeEvent, useEffect, useState } from "react";
import AccountMini from "../AccountMini";

import { BigNumber, utils as ethersUtils, Contract } from "ethers";
import { isEthApi, isPolkadotApi, isEthChain, isPolkadotChain, triggerContract } from "@feemarket/app-utils";
import { useFeeMarket, useApi } from "@feemarket/app-provider";
import { ETH_CHAIN_CONF, POLKADOT_CHAIN_CONF } from "@feemarket/app-config";
import type { FeeMarketSourceChainPolkadot, FeeMarketSourceChainEth } from "@feemarket/app-types";
import { from, switchMap, forkJoin } from "rxjs";

const SENTINEL_HEAD = "0x0000000000000000000000000000000000000001";
// const SENTINEL_HEAD = "0000000000000000000000000000000000000000000000000000000000000001";

export interface RegisterRelayerModalProps {
  isVisible: boolean;
  relayerAddress: string;
  onClose: () => void;
}

const RegisterRelayerModal = ({ isVisible, relayerAddress, onClose }: RegisterRelayerModalProps) => {
  const { t } = useTranslation();
  const { currentMarket } = useFeeMarket();
  const { api } = useApi();
  const [isModalVisible, setModalVisibility] = useState(false);
  const [deposit, setDeposit] = useState("");
  const [depositError, setDepositError] = useState<JSX.Element | null>(null);
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

  const onRegister = () => {
    if (currentMarket?.source && isEthChain(currentMarket.source) && isEthApi(api) && deposit && quote) {
      const depositAmount = ethersUtils.parseUnits(deposit, nativeToken.decimals);
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
            let newIndex = -1;
            for (let i = 0; i < book.length; i++) {
              if (quoteAmount.gt(book[i][2][0])) {
                newIndex = i;
                break;
              }
            }
            const newPrev = newIndex === -1 ? SENTINEL_HEAD : book[newIndex][1][0];

            console.log("book:", book);
            console.log("enroll prev:", newPrev);
            console.log("enroll amount:", depositAmount.toString(), quoteAmount.toString());

            triggerContract(
              contract,
              "enroll",
              [newPrev, quoteAmount],
              {
                errorCallback: ({ error }) => {
                  console.error("call enroll:", error);
                },
                responseCallback: ({ response }) => {
                  onCloseModal();
                  console.log("call enroll response:", response);
                },
                successCallback: ({ receipt }) => {
                  console.log("call enroll receipt:", receipt);
                },
              },
              { value: depositAmount.toString() }
            );
          },
          error: (error) => {
            console.error("get all relayers:", error);
          },
        });
    } else if (
      currentMarket?.source &&
      isPolkadotChain(currentMarket.source) &&
      isPolkadotApi(api) &&
      deposit &&
      quote
    ) {
      //
    } else {
      onCloseModal();
    }
  };

  const onDepositChanged = (e: ChangeEvent<HTMLInputElement>) => {
    setDepositError(null);
    const value = e.target.value;
    setDeposit(value);
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
      confirmText={t(localeKeys.register)}
      onConfirm={onRegister}
      isVisible={isModalVisible}
      modalTitle={t(localeKeys.registerRelayer)}
    >
      <div className={"flex flex-col gap-[1.25rem]"}>
        <div className={"flex flex-col gap-[0.625rem]"}>
          <div className={"text-12-bold"}>{t(localeKeys.account)}</div>
          <AccountMini address={relayerAddress} />
        </div>
        {/*Deposit guarantee*/}
        <div className={"flex flex-col gap-[0.625rem]"}>
          <div className={"text-12-bold"}>{t(localeKeys.youDeposit)}</div>
          <Input
            value={deposit}
            error={depositError}
            leftIcon={null}
            className={"!text-14-bold"}
            onChange={onDepositChanged}
            rightSlot={
              <div className={"text-14-bold flex items-center px-[0.625rem]"}>{nativeToken?.symbol ?? "-"}</div>
            }
          />
          {/* {!depositError && (
            <div className={"text-12 text-halfWhite"}>{t(localeKeys.youDepositInfo, { amount: "6,000 RING" })}</div>
          )} */}
        </div>

        {/*Your quote*/}
        <div className={"flex flex-col gap-[0.625rem]"}>
          <div className={"text-12-bold"}>{t(localeKeys.youQuote)}</div>
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
      </div>
    </ModalEnhanced>
  );
};

const generateError = (error: string) => {
  return <div>{error}</div>;
};

export default RegisterRelayerModal;
