import { useTranslation } from "react-i18next";
import { Button, Spinner } from "@darwinia/ui";
import localeKeys from "../../locale/localeKeys";
import { useWallet } from "../../hooks/wallet";

const ConnectWallet = ({ loading, isInstalled }: { loading?: boolean; isInstalled: boolean }) => {
  const { t } = useTranslation();
  const { logo, connect } = useWallet();

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
              <img className={"w-full"} src={logo} alt="..." />
            </div>
            <div>
              <Button className={"px-[0.9375rem]"} onClick={connect}>
                {t(localeKeys.connectWallet)}
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
