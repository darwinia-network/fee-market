import Account from "../Account";
import Balance from "../Balance";
import RelayerDetailsChart from "../RelayerDetailsChart";
import RelatedOrders from "../RelatedOrders";
import { Button, SlideDownUp } from "@darwinia/ui";
import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import { useEffect, useState } from "react";
import { useApi, useMarket } from "../../hooks";
import { isEthChain, getEthChainConfig, isWalletClient, isPolkadotChain, isEthersApi } from "../../utils";
import { switchNetwork } from "@wagmi/core";
import { Subscription, from } from "rxjs";
import { ethers } from "ethers";

interface AddEthereumChainParameter {
  chainId: string; // A 0x-prefixed hexadecimal string
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string; // 2-6 characters long
    decimals: 18;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
  iconUrls?: string[]; // Currently ignored.
}

const RelayerDashboard = () => {
  const { t } = useTranslation();
  const { sourceChain } = useMarket();
  const { signerApi: api } = useApi();
  const [matchNetwork, setMatchNetwork] = useState(false);

  const handleSwitchNetwork = async () => {
    if (isEthChain(sourceChain)) {
      const chainConfig = getEthChainConfig(sourceChain);

      if (isEthersApi(api)) {
        const chainId = ethers.utils.hexValue(chainConfig.chainId);
        try {
          await api.send("wallet_switchEthereumChain", [{ chainId }]);
        } catch (switchError) {
          console.error("switch network:", switchError);
          // This error code indicates that the chain has not been added to MetaMask.
          if ((switchError as { code: number }).code === 4902) {
            try {
              const params: AddEthereumChainParameter = {
                chainId,
                chainName: chainConfig.chainName,
                nativeCurrency: {
                  name: chainConfig.nativeToken.symbol,
                  symbol: chainConfig.nativeToken.symbol,
                  decimals: 18,
                },
                rpcUrls: [chainConfig.provider.rpc],
                blockExplorerUrls: [chainConfig.explorer.url],
              };
              await api.send("wallet_addEthereumChain", [params]);
            } catch (addError) {
              console.error("add network:", addError);
              // handle "add" error
            }
          }
          // handle other "switch" errors
        }
      } else if (isWalletClient(api)) {
        await switchNetwork({ chainId: chainConfig.chainId });
      }
    }
  };

  useEffect(() => {
    let sub$$: Subscription | null = null;

    if (isPolkadotChain(sourceChain)) {
      setMatchNetwork(true);
    } else if (isEthChain(sourceChain)) {
      const chainConfig = getEthChainConfig(sourceChain);

      if (isEthersApi(api)) {
        sub$$ = from(api.getNetwork()).subscribe(({ chainId }) => {
          if (chainId === chainConfig.chainId) {
            setMatchNetwork(true);
          }
        });
      } else if (isWalletClient(api)) {
        sub$$ = from(api.getChainId()).subscribe((chainId) => {
          if (chainId === chainConfig.chainId) {
            setMatchNetwork(true);
          }
        });
      }
    }

    return () => {
      sub$$?.unsubscribe();
      setMatchNetwork(false);
    };
  }, [api, sourceChain]);

  return (
    /*Don't use flex gap to avoid a "junky gap animation" when the notification slides down */
    <div className={"flex flex-col"}>
      {/*Notification*/}
      <SlideDownUp isVisible={!matchNetwork}>
        <div className={"mb-[0.9375rem] lg:mb-[1.875rem]"}>
          <div
            className={
              "card flex flex-col lg:flex-row lg:justify-between bg-danger gap-[0.9375rem] px-[0.9375rem] py-[1.125rem]"
            }
          >
            <div className={"flex-1 flex items-center"}>{t(localeKeys.switchAccountNotice)}</div>
            <div>
              <Button
                onClick={handleSwitchNetwork}
                className={"!bg-white w-full !text-danger !text-14-bold lg:!h-[1.875rem]"}
              >
                {t(localeKeys.switchNetwork)}
              </Button>
            </div>
          </div>
        </div>
      </SlideDownUp>
      <div className={"mb-[0.9375rem] lg:mb-[1.875rem]"}>
        <Account advanced={matchNetwork} />
      </div>
      <div className={"mb-[0.9375rem] lg:mb-[1.875rem]"}>
        <Balance matchNetwork={matchNetwork} />
      </div>
      <div className={"mb-[0.9375rem] lg:mb-[1.875rem]"}>
        <RelayerDetailsChart />
      </div>
      <div>
        <RelatedOrders />
      </div>
    </div>
  );
};

export default RelayerDashboard;
