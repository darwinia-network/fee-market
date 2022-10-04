import { ModalEnhanced } from "@darwinia/ui";
import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import { useEffect, useState } from "react";
import AccountMini from "../AccountMini";

export interface CancelRelayerModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const CancelRelayerModal = ({ isVisible, onClose }: CancelRelayerModalProps) => {
  const { t } = useTranslation();
  const [isModalVisible, setModalVisibility] = useState(false);

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

  const onConfirm = () => {
    console.log("on confirm===");
    onCloseModal();
  };

  return (
    <ModalEnhanced
      onCancel={onCancelModal}
      onClose={onCloseModal}
      cancelText={t(localeKeys.cancel)}
      confirmText={t(localeKeys.confirm)}
      onConfirm={onConfirm}
      isVisible={isModalVisible}
      modalTitle={t(localeKeys.confirmCancelRelayer)}
    >
      <div className={"flex flex-col gap-[1.25rem]"}>
        <div className={"flex flex-col gap-[0.625rem]"}>
          <div className={"text-12-bold"}>{t(localeKeys.account)}</div>
          <AccountMini />
        </div>
        {/*warning*/}
        <div className={"flex flex-col gap-[0.625rem]"}>{t(localeKeys.cancelRelayerWarning)}</div>

        <div className={"bg-divider w-full h-[1px]"} />

        <div className={"flex flex-col gap-[0.625rem]"}>{t(localeKeys.feeEstimation, { amount: "0.12551 RING" })}</div>
      </div>
    </ModalEnhanced>
  );
};

export default CancelRelayerModal;
