import relayerAvatar from "../../assets/images/relayer-avatar.svg";
import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import { useState } from "react";
import { Button } from "@darwinia/ui";
import helpIcon from "../../assets/images/help.svg";
import AccountSelectionModal from "../AccountSelectionModal";
import RegisterRelayerModal from "../RegisterRelayerModal";
import CancelRelayerModal from "../CancelRelayerModal";

interface AccountProps {
  advanced?: boolean;
}

const Account = ({ advanced = false }: AccountProps) => {
  const { t } = useTranslation();
  const [isRegistered, setRegistered] = useState(true);

  const [isActiveAccountModalVisible, setActiveAccountModalVisible] = useState(false);
  const [isRegisterRelayerModalVisible, setRegisterRelayerModalVisible] = useState(false);
  const [isCancelRelayerModalVisible, setCancelRelayerModalVisible] = useState(false);

  const onSwitchAccount = () => {
    setActiveAccountModalVisible(true);
  };

  const onSwitchNetworkModalClose = () => {
    setActiveAccountModalVisible(false);
  };

  const onRegisterRelayer = () => {
    setRegisterRelayerModalVisible(true);
  };

  const onRegisterRelayerModalClose = () => {
    setRegisterRelayerModalVisible(false);
  };

  const onCancelRelayerModalClose = () => {
    setCancelRelayerModalVisible(false);
  };

  const onMoreActions = () => {
    setCancelRelayerModalVisible(true);
  };

  return (
    <div
      className={`flex card gap-[0.9375rem] ${advanced ? "flex-col lg:flex-row lg:items-center" : "lg:items-center"}`}
    >
      <div className={"flex flex-1 lg:items-center gap-[0.9375rem] overflow-hidden"}>
        <img className={"rounded-full w-[2.5rem] h-[2.5rem] shrink-0"} src={relayerAvatar} alt="image" />
        <div
          className={`overflow-hidden flex ${advanced ? "" : "lg:items-center"} flex-1 flex-col ${
            advanced ? "" : "lg:flex-row lg:gap-[0.9375rem]"
          } gap-[0.3125rem]`}
        >
          <div className={"flex gap-[0.3125rem] lg:gap-[0.625rem] flex-col lg:flex-row"}>
            <div className={"uppercase text-18-bold"}>🚀KUBE-VALI 2</div>
            {advanced && (
              <div>
                <span
                  className={`text-12-bold ${
                    isRegistered ? "bg-primary" : "bg-halfWhite"
                  } rounded-[0.3125rem] px-[0.3125rem] py-[0.25rem]`}
                >
                  {isRegistered ? t(localeKeys.registered) : t(localeKeys.unregistered)}
                </span>
              </div>
            )}
          </div>
          <div className={"break-words"}>16ZL8yLyXv3V3L3z9ofR1ovFLziyXaN1DPq4yffMAZ9czzBD</div>
        </div>
      </div>
      {advanced && (
        <div className={"shrink-0 justify-end flex-wrap flex flex-1 flex-col lg:flex-row gap-[0.9375rem] items-center"}>
          <Button
            className={
              "px-[0.9375rem] justify-center lg:justify-start flex items-center justify-between lg:w-auto shrink-0 gap-[0.375rem]"
            }
            plain={true}
            onClick={onSwitchAccount}
          >
            {t(localeKeys.switchAccount)}
          </Button>
          <Button
            className={
              "px-[0.9375rem] justify-center lg:justify-start flex items-center justify-between lg:w-auto shrink-0"
            }
            plain={true}
          >
            <div>{t(localeKeys.runBridger)}</div>
            <div className={"self-stretch pl-[0.375rem] flex"}>
              <img className={"w-[0.875rem] h-[0.875rem] self-center"} src={helpIcon} alt="image" />
            </div>
          </Button>
          {isRegistered ? (
            <Button
              onClick={onMoreActions}
              className={
                "px-[0.9375rem] justify-center lg:justify-start flex items-center justify-between lg:w-auto shrink-0 gap-[0.375rem]"
              }
              plain={true}
            >
              {t(localeKeys.moreActions)}
            </Button>
          ) : (
            <Button
              onClick={onRegisterRelayer}
              className={
                "px-[0.9375rem] justify-center lg:justify-start flex items-center justify-between lg:w-auto shrink-0 gap-[0.375rem]"
              }
            >
              <div>{t(localeKeys.registerRelayer)}</div>
              <div className={"self-stretch pl-[0.375rem] flex"}>
                <img className={"w-[0.875rem] h-[0.875rem] self-center"} src={helpIcon} alt="image" />
              </div>
            </Button>
          )}
        </div>
      )}

      {/*Account selection modal*/}
      <AccountSelectionModal onClose={onSwitchNetworkModalClose} isVisible={isActiveAccountModalVisible} />
      {/*Register relayer modal*/}
      <RegisterRelayerModal onClose={onRegisterRelayerModalClose} isVisible={isRegisterRelayerModalVisible} />
      {/*Register relayer modal*/}
      <CancelRelayerModal onClose={onCancelRelayerModalClose} isVisible={isCancelRelayerModalVisible} />
    </div>
  );
};

export default Account;
