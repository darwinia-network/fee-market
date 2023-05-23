import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import { useMetaMask, usePolkadotJs, useWalletConnect } from "../../hooks/wallet";
import { useMarket } from "../../hooks";
import { getChainConfig } from "../../utils";
import { Spinner } from "@darwinia/ui";

const ConnectWallet = () => {
  const { t } = useTranslation();
  const { sourceChain } = useMarket();
  const metamask = useMetaMask();
  const polkadotJs = usePolkadotJs();
  const walletConnect = useWalletConnect();

  const chainConfig = sourceChain ? getChainConfig(sourceChain) : null;

  return (
    <div
      className={
        "card lg:min-h-[25rem] lg:px-[18.625rem] flex flex-col justify-center items-center gap-[0.9375rem] lg:gap-[1.875rem]"
      }
    >
      <div className="flex items-center justify-center gap-12">
        {[metamask, walletConnect, polkadotJs].map(({ id, installed, logo, name, loading, connect }) => {
          if (chainConfig?.wallets.includes(id)) {
            return (
              <Spinner isLoading={loading} size="small" key={id}>
                <button
                  className={`flex flex-col items-center justify-center gap-5 w-48 h-48 rounded-sm ${
                    installed
                      ? "border border-black bg-black transition hover:border-primary active:opacity-80"
                      : "cursor-not-allowed bg-gray/20 opacity-80"
                  }`}
                  onClick={connect}
                >
                  <img alt="..." src={logo} />
                  <span className="text-center">{name}</span>
                </button>
              </Spinner>
            );
          }
          return null;
        })}
      </div>
      <div className="text-center text-gray">{t(localeKeys.loginInfo)}</div>
    </div>
  );
};

export default ConnectWallet;
