import { Input, ModalEnhanced } from "@darwinia/ui";
import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import { ChangeEvent, useEffect, useState } from "react";
import AccountMini from "../AccountMini";

export interface RegisterRelayerModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const RegisterRelayerModal = ({ isVisible, onClose }: RegisterRelayerModalProps) => {
  const { t } = useTranslation();
  const [isModalVisible, setModalVisibility] = useState(false);
  const [deposit, setDeposit] = useState("");
  const [depositError, setDepositError] = useState<JSX.Element | null>(null);
  const [quote, setQuote] = useState("");
  const [quoteError, setQuoteError] = useState<JSX.Element | null>(null);

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
    if (deposit === "") {
      setDepositError(generateError(t(localeKeys.depositAmountLimitError, { amount: "6,000 RING" })));
      return;
    }

    if (quote === "") {
      setQuoteError(generateError(t(localeKeys.quoteAmountLimitError, { amount: "15 RING" })));
      return;
    }
    console.log("deposit=====", deposit);
    console.log("quote====", quote);
    onCloseModal();
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
          <AccountMini />
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
            rightSlot={<div className={"text-14-bold flex items-center px-[0.625rem]"}>RING</div>}
          />
          {!depositError && (
            <div className={"text-12 text-halfWhite"}>{t(localeKeys.youDepositInfo, { amount: "6,000 RING" })}</div>
          )}
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
                {t(localeKeys.perOrder, { currency: "RING" })}
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
