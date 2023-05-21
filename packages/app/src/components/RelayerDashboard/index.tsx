import Account from "../Account";
import Balance from "../Balance";
import RelayerDetailsChart from "../RelayerDetailsChart";
import RelatedOrders from "../RelatedOrders";
import { Button, SlideDownUp } from "@darwinia/ui";
import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import { useEffect, useState } from "react";
import { useApi, useMarket } from "../../hooks";
import { isEthChain, getEthChainConfig, isEthSignerApi, isPolkadotChain } from "../../utils";
import { switchNetwork } from "@wagmi/core";
import { Subscription, from } from "rxjs";

const RelayerDashboard = () => {
  const { t } = useTranslation();
  const { sourceChain } = useMarket();
  const { signerApi: api } = useApi();
  const [matchNetwork, setMatchNetwork] = useState(false);

  const handleSwitchNetwork = async () => {
    if (sourceChain && isEthChain(sourceChain)) {
      const { chainId } = getEthChainConfig(sourceChain);
      await switchNetwork({ chainId });
    }
  };

  useEffect(() => {
    let sub$$: Subscription | null = null;

    if (isPolkadotChain(sourceChain)) {
      setMatchNetwork(true);
    } else if (isEthChain(sourceChain) && isEthSignerApi(api)) {
      sub$$ = from(api.getChainId()).subscribe((chainId) => {
        if (chainId === getEthChainConfig(sourceChain).chainId) {
          setMatchNetwork(true);
        }
      });
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
