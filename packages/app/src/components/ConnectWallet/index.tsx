import { useTranslation } from "react-i18next";
import metamaskLogo from "../../assets/images/metamask-logo.svg";
import polkadotLogo from "../../assets/images/polkadot-logo.svg";
import { Button, Spinner } from "@darwinia/ui";
import localeKeys from "../../locale/localeKeys";

import { isPolkadotChain } from "@feemarket/utils";
import type { FeeMarketChain } from "@feemarket/config";

const ConnectWallet = ({
  loading,
  isInstalled,
  sourceChain,
  onConnected,
}: {
  sourceChain: FeeMarketChain | undefined;
  loading?: boolean;
  isInstalled: boolean;
  onConnected: () => void;
}) => {
  const { t } = useTranslation();
  const onConnectWallet = () => {
    onConnected();
  };

  return (
    <Spinner isLoading={loading ?? false}>
      <div
        className={
          "card lg:min-h-[25rem] lg:px-[18.625rem] flex flex-col justify-center items-center gap-[0.9375rem] lg:gap-[1.875reem]"
        }
      >
        {isInstalled ? (
          <>
            <div className={"w-[5.3125rem] h-[5.3125rem]"}>
              <img className={"w-full"} src={isPolkadotChain(sourceChain) ? polkadotLogo : metamaskLogo} alt="image" />
            </div>
            <div>
              <Button className={"px-[0.9375rem]"} onClick={onConnectWallet}>
                {isPolkadotChain(sourceChain) ? t(localeKeys.connectWallet) : t(localeKeys.connectMetamask)}
              </Button>
            </div>
            <div className={"text-center"}>{t(localeKeys.loginInfo)}</div>
          </>
        ) : (
          <p>No Wallet Found</p>
        )}
      </div>
    </Spinner>
  );
};

export default ConnectWallet;
