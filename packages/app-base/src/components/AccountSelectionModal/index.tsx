import { ModalEnhanced } from "@darwinia/ui";
import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import { useEffect, useState } from "react";
import relayerAvatar from "../../assets/images/relayer-avatar.svg";

export interface AccountSelectionModalProps {
  isVisible: boolean;
  onClose: () => void;
}

interface AccountInfo {
  id: string;
  account: string;
  avatar: string;
  name: string;
  balance: string;
}

const accounts: AccountInfo[] = [
  {
    id: "1",
    account: "2oXKyw2...NXeSA7",
    avatar: relayerAvatar,
    balance: "94,744.238 RING",
    name: "test-1",
  },
  {
    id: "2",
    account: "2oXKyw2...NXeSA8",
    avatar: relayerAvatar,
    balance: "74,755.200 RING",
    name: "test-2",
  },
  {
    id: "3",
    account: "2oXKyw2...NXeSA9",
    avatar: relayerAvatar,
    balance: "44,766.765 RING",
    name: "test-3",
  },
];

const AccountSelectionModal = ({ isVisible, onClose }: AccountSelectionModalProps) => {
  const { t } = useTranslation();
  const [isModalVisible, setModalVisibility] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountInfo | null>(null);

  useEffect(() => {
    setModalVisibility(isVisible);
  }, [isVisible]);

  useEffect(() => {
    //select the first account by default
    if (accounts.length > 0) {
      setSelectedAccount(accounts[0]);
    }
  }, []);

  const onCloseModal = () => {
    setModalVisibility(false);
    onClose();
  };

  const onAccountSelect = (account: AccountInfo) => {
    setSelectedAccount(account);
    onCloseModal();
  };

  const accountsList = accounts.map((item) => {
    const isSelected = item.account === selectedAccount?.account;
    const accountBorder = isSelected ? "border-primary" : "border-white";
    return (
      <div
        className={`cursor-pointer clickable flex gap-[1.25rem] border ${accountBorder} rounded-[0.3125rem] px-[1.25rem] py-[0.625rem]`}
        key={item.id}
        onClick={() => {
          onAccountSelect(item);
        }}
      >
        <div className={"rounded-full w-[2.25rem] h-[2.25rem]"}>
          <img className={"rounded-full w-full"} src={item.avatar} alt="" />
        </div>
        <div className={"flex flex-col gap-[0.3125rem]"}>
          <div className={"text-18-bold"}>{item.name}</div>
          <div className={"text-14"}>{item.account}</div>
          <div className={"text-12 text-halfWhite"}>{item.balance}</div>
        </div>
      </div>
    );
  });

  return (
    <ModalEnhanced onClose={onCloseModal} isVisible={isModalVisible} modalTitle={t(localeKeys.selectActiveAccount)}>
      <div className={"flex flex-col gap-[1.25rem]"}>{accountsList}</div>
    </ModalEnhanced>
  );
};

export default AccountSelectionModal;
