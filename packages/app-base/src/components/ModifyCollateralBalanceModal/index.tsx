import { Input, ModalEnhanced } from "@darwinia/ui";
import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import { ChangeEvent, useEffect, useState } from "react";
import AccountMini from "../AccountMini";

export interface ModifyCollateralBalanceModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const ModifyCollateralBalanceModal = ({ isVisible, onClose }: ModifyCollateralBalanceModalProps) => {
  const { t } = useTranslation();
  const [isModalVisible, setModalVisibility] = useState(false);
  const [deposit, setDeposit] = useState("");
  const [depositError, setDepositError] = useState<JSX.Element | null>(null);

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
    if (deposit === "") {
      setDepositError(generateError(t(localeKeys.depositAmountLimitError, { amount: "15 RING" })));
      return;
    }
    console.log("quote====", deposit);
    onCloseModal();
  };

  const onDepositChanged = (e: ChangeEvent<HTMLInputElement>) => {
    setDepositError(null);
    const value = e.target.value;
    setDeposit(value);
  };

  return (
    <ModalEnhanced
      onCancel={onCancelModal}
      onClose={onCloseModal}
      cancelText={t(localeKeys.cancel)}
      confirmText={t(localeKeys.confirm)}
      onConfirm={onModifyQuote}
      isVisible={isModalVisible}
      modalTitle={t(localeKeys.modifyCollateralBalance)}
    >
      <div className={"flex flex-col gap-[1.25rem]"}>
        {/*Your current balance*/}
        <div className={"flex flex-col gap-[0.625rem]"}>
          <div className={"text-12-bold"}>{t(localeKeys.yourCollateralBalance)}</div>
          <div className={"flex bg-divider rounded-[0.3125rem] h-[2.5rem] items-center justify-end px-[0.625rem]"}>
            <div className={"flex-1 text-14-bold"}>1,000</div>
            <div className={"flex-1 text-right text-14-bold"}>RING</div>
          </div>
        </div>

        {/*Your new balancce*/}
        <div className={"flex flex-col gap-[0.625rem]"}>
          <div className={"text-12-bold"}>{t(localeKeys.youModifyBalanceTo)}</div>
          <Input
            value={deposit}
            error={depositError}
            leftIcon={null}
            className={"!text-14-bold"}
            onChange={onDepositChanged}
            rightSlot={<div className={"text-14-bold flex items-center px-[0.625rem]"}>RING</div>}
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

export default ModifyCollateralBalanceModal;
