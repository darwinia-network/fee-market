import { ModalEnhanced } from "@darwinia/ui";
import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import { useEffect, useState } from "react";
import relayerAvatar from "../../assets/images/relayer-avatar.svg";
import { useApi } from "@feemarket/app-provider";
import { useAccountName } from "@feemarket/app-hooks";
import { Scrollbars } from "react-custom-scrollbars";
export interface AccountSelectionModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const AccountName = ({ address }: { address: string }) => {
  const { displayName } = useAccountName(address);
  return <div className={"text-18-bold"}>{displayName}</div>;
};

const AccountSelectionModal = ({ isVisible, onClose }: AccountSelectionModalProps) => {
  const { t } = useTranslation();
  const { accounts, currentAccount, setCurrentAccount } = useApi();
  const [isModalVisible, setModalVisibility] = useState(false);

  useEffect(() => {
    setModalVisibility(isVisible);
  }, [isVisible]);

  const onCloseModal = () => {
    setModalVisibility(false);
    onClose();
  };

  const onAccountSelect = (account: string) => {
    setCurrentAccount(account);
    onCloseModal();
  };

  const accountsList = (accounts || []).map((item, index) => {
    const isSelected = item === currentAccount;
    const accountBorder = isSelected ? "border-primary" : "border-white";
    return (
      <div
        className={`cursor-pointer clickable flex gap-[1.25rem] border ${accountBorder} rounded-[0.3125rem] px-[1.25rem] py-[0.625rem]`}
        key={index}
        onClick={() => {
          onAccountSelect(item);
        }}
      >
        <div className={"rounded-full w-[2.25rem] h-[2.25rem]"}>
          <img className={"rounded-full w-full"} src={relayerAvatar} alt="" />
        </div>
        <div className={"flex flex-col gap-[0.3125rem]"}>
          <AccountName address={item} />
          <div className={"text-14"}>{item}</div>
          {/* <div className={"text-12 text-halfWhite"}>{item.balance}</div> */}
        </div>
      </div>
    );
  });

  return (
    <ModalEnhanced
      onClose={onCloseModal}
      isVisible={isModalVisible}
      modalTitle={t(localeKeys.selectActiveAccount)}
      contentClassName="!px-0"
    >
      <Scrollbars autoHeight={true} autoHeightMax="70vh">
        <div className={"flex flex-col gap-[1.25rem] mx-[0.9375rem]"}>{accountsList}</div>
      </Scrollbars>
    </ModalEnhanced>
  );
};

export default AccountSelectionModal;
