import relayerAvatar from "../../assets/images/relayer-avatar.svg";
import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import { useEffect, useState } from "react";
import { Button, Dropdown, Tooltip } from "@darwinia/ui";
import helpIcon from "../../assets/images/help.svg";
import AccountSelectionModal from "../AccountSelectionModal";
import RegisterRelayerModal from "../RegisterRelayerModal";
import CancelRelayerModal from "../CancelRelayerModal";

import { BigNumber, Contract } from "ethers";
import { useFeeMarket, useApi } from "@feemarket/app-provider";
import { ETH_CHAIN_CONF, POLKADOT_CHAIN_CONF, BALANCE_DECIMALS } from "@feemarket/app-config";
import { isEthApi, isEthChain, formatBalance } from "@feemarket/app-utils";
import type { FeeMarketSourceChainPolkadot, FeeMarketSourceChainEth } from "@feemarket/app-types";
import { from, Subscription } from "rxjs";

interface AccountProps {
  advanced?: boolean;
  relayerAddress: string;
}

const Account = ({ advanced = false, relayerAddress }: AccountProps) => {
  const { t } = useTranslation();
  const [isRegistered, setRegistered] = useState(false);

  const { currentMarket } = useFeeMarket();
  const { api } = useApi();

  const [isActiveAccountModalVisible, setActiveAccountModalVisible] = useState(false);
  const [isRegisterRelayerModalVisible, setRegisterRelayerModalVisible] = useState(false);
  const [isCancelRelayerModalVisible, setCancelRelayerModalVisible] = useState(false);

  useEffect(() => {
    let sub$$: Subscription;

    if (currentMarket?.source && isEthChain(currentMarket.source) && isEthApi(api)) {
      const chainConfig = ETH_CHAIN_CONF[currentMarket.source];
      const contract = new Contract(chainConfig.contractAddress, chainConfig.contractInterface, api);

      sub$$ = from(contract.isRelayer(relayerAddress) as Promise<boolean>).subscribe({
        next: setRegistered,
        error: (error) => {
          setRegistered(false);
          console.error("check is relayer:", error);
        },
      });
    }

    return () => {
      if (sub$$) {
        sub$$.unsubscribe();
      }
    };
  }, [relayerAddress, currentMarket?.source, api]);

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

  const onCancelRelayer = () => {
    console.log("onCancelRelayer=====");
    setCancelRelayerModalVisible(true);
  };

  const onRunBridger = () => {
    console.log("run bridger====");
  };

  const getMoreActionsDropdown = () => {
    return (
      <div>
        <Button btnType={"secondary"} className={"!px-[0.9375rem] w-full min-w-[150px]"} onClick={onCancelRelayer}>
          {t(localeKeys.cancelRelayer)}
        </Button>
      </div>
    );
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
            <div className={"uppercase text-18-bold"}>🚀Account name</div>
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
          <div className={"break-words"}>{relayerAddress}</div>
        </div>
      </div>
      {advanced && (
        <div className={"shrink-0 justify-end flex-wrap flex flex-1 flex-col lg:flex-row gap-[0.9375rem] items-center"}>
          <Button
            className={"px-[0.9375rem] w-full lg:w-auto shrink-0"}
            btnType={"secondary"}
            onClick={onSwitchAccount}
          >
            {t(localeKeys.switchAccount)}
          </Button>
          <Button
            onClick={onRunBridger}
            className={"px-[0.9375rem] w-full flex justify-center items-center lg:w-auto shrink-0 gap-[0.375rem]"}
            btnType={"secondary"}
          >
            <div>{t(localeKeys.runBridger)}</div>
            <Tooltip
              placement={"left"}
              message={<div dangerouslySetInnerHTML={{ __html: t(localeKeys.runBridgerTooltip) }} />}
              toolTipClassName={"!w-[16.75rem]"}
              className={"self-stretch pl-[0.375rem] flex"}
            >
              <img className={"w-[0.875rem] h-[0.875rem] self-center"} src={helpIcon} alt="image" />
            </Tooltip>
          </Button>
          {!isRegistered ? (
            <Dropdown
              placement={"right"}
              className={"w-full lg:w-auto"}
              triggerEvent={"click"}
              closeOnInteraction={true}
              overlay={getMoreActionsDropdown()}
              offset={[0, 10]}
              dropdownClassName={"w-full lg:w-auto"}
            >
              <Button className={"px-[0.9375rem] w-full lg:w-auto shrink-0"} btnType={"secondary"}>
                {t(localeKeys.moreActions)}
              </Button>
            </Dropdown>
          ) : (
            <Button
              onClick={onRegisterRelayer}
              className={"px-[0.9375rem] w-full flex justify-center items-center lg:w-auto shrink-0 gap-[0.375rem]"}
            >
              <div>{t(localeKeys.registerRelayer)}</div>
              <Tooltip
                placement={"left"}
                message={<div dangerouslySetInnerHTML={{ __html: t(localeKeys.registerRelayerTooltip) }} />}
                toolTipClassName={"!w-[16.75rem]"}
                className={"self-stretch pl-[0.375rem] flex"}
              >
                <img className={"w-[0.875rem] h-[0.875rem] self-center"} src={helpIcon} alt="image" />
              </Tooltip>
            </Button>
          )}
        </div>
      )}

      {/*Account selection modal*/}
      <AccountSelectionModal onClose={onSwitchNetworkModalClose} isVisible={isActiveAccountModalVisible} />
      {/*Register relayer modal*/}
      <RegisterRelayerModal
        onClose={onRegisterRelayerModalClose}
        isVisible={isRegisterRelayerModalVisible}
        relayerAddress={relayerAddress}
      />
      {/*Register relayer modal*/}
      <CancelRelayerModal onClose={onCancelRelayerModalClose} isVisible={isCancelRelayerModalVisible} />
    </div>
  );
};

export default Account;
