import Account from "../Account";
import Balance from "../Balance";
import RelayerDetailsChart from "../RelayerDetailsChart";
import RelayerDetailsTable from "../RelayerDetailsTable";
import { Button, SlideDownUp } from "@darwinia/ui";
import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import { useEffect, useState } from "react";

import type { FeeMarketSourceChainPolkadot, AddEthereumChainParameter } from "@feemarket/app-types";
import { ETH_CHAIN_CONF, POLKADOT_CHAIN_CONF } from "@feemarket/app-config";
import { useFeeMarket, useApi } from "@feemarket/app-provider";
import { useRelayersDetailData } from "@feemarket/app-hooks";
import { isEthApi, isEthChain } from "@feemarket/app-utils";
import { utils as ethersUtils, Contract } from "ethers";

const relayerAddress = "5D2ZU3QVvebrKu8bLMFntMDEAXyQnhSx7C2Nk9t3gWTchMDS";

const goerliRelayerAddress = "0x7181932Da75beE6D3604F4ae56077B52fB0c5a3b";
const ethereumRelayerAddress = "0x2EaBE5C6818731E282B80De1a03f8190426e0Dd9";
const darwiniaSmartChainRelayerAdrress = "0x2EaBE5C6818731E282B80De1a03f8190426e0Dd9";

const ethRelayerAddress = darwiniaSmartChainRelayerAdrress;

const RelayerDashboard = () => {
  const { t } = useTranslation();
  const { currentMarket, setRefresh } = useFeeMarket();
  const { api, currentChainId } = useApi();
  const { rewardAndSlashData, quoteHistoryData, relayerRelatedOrdersData } = useRelayersDetailData({
    relayerAddress,
    currentMarket,
    setRefresh,
  });
  const [isNotificationVisible, setNotificationVisibility] = useState(true);

  const [testRelayerAddress, setTestRelayerAddress] = useState("");

  const nativeToken = POLKADOT_CHAIN_CONF[currentMarket?.source as FeeMarketSourceChainPolkadot]
    ? POLKADOT_CHAIN_CONF[currentMarket?.source as FeeMarketSourceChainPolkadot].nativeToken
    : null;

  useEffect(() => {
    if (currentMarket?.source && isEthChain(currentMarket.source) && isEthApi(api)) {
      const chainConfig = ETH_CHAIN_CONF[currentMarket.source];
      const contract = new Contract(chainConfig.contractAddress, chainConfig.contractInterface, api);

      if (chainConfig.isSmartChain) {
        (contract.getTopRelayers() as Promise<string[]>).then((res) => {
          setTestRelayerAddress(res[0] || "");
        });
      } else {
        (contract.getTopRelayer() as Promise<string>).then((res) => {
          setTestRelayerAddress(res);
        });
      }
    }
  }, [api, currentMarket]);

  const onSwitchNetwork = async () => {
    if (currentMarket?.source && isEthChain(currentMarket.source) && isEthApi(api)) {
      const chainId = ethersUtils.hexValue(ETH_CHAIN_CONF[currentMarket.source].chainId);

      try {
        await api.send("wallet_switchEthereumChain", [{ chainId }]);
      } catch (switchError) {
        console.error("switch network:", switchError);
        // This error code indicates that the chain has not been added to MetaMask.
        if ((switchError as { code: number }).code === 4902) {
          try {
            const params: AddEthereumChainParameter = {
              chainId,
              chainName: ETH_CHAIN_CONF[currentMarket.source].chainName,
              nativeCurrency: {
                name: ETH_CHAIN_CONF[currentMarket.source].nativeToken.symbol,
                symbol: ETH_CHAIN_CONF[currentMarket.source].nativeToken.symbol,
                decimals: 18,
              },
              rpcUrls: [ETH_CHAIN_CONF[currentMarket.source].provider.rpc],
              blockExplorerUrls: [ETH_CHAIN_CONF[currentMarket.source].explorer.url],
            };
            await api.send("wallet_addEthereumChain", [params]);
          } catch (addError) {
            console.error("add network:", addError);
            // handle "add" error
          }
        }
        // handle other "switch" errors
      }
    }
  };

  const onShowNotification = () => {
    setNotificationVisibility(true);
  };

  const onHideNotification = () => {
    setNotificationVisibility(false);
  };

  useEffect(() => {
    if (
      currentMarket?.source &&
      isEthChain(currentMarket.source) &&
      ETH_CHAIN_CONF[currentMarket.source].chainId !== currentChainId
    ) {
      onShowNotification();
    } else {
      onHideNotification();
    }
  }, [currentMarket?.source, currentChainId]);

  return (
    /*Don't use flex gap to avoid a "junky gap animation" when the notification slides down */
    <div className={"flex flex-col"}>
      {/*Notification*/}
      <SlideDownUp isVisible={isNotificationVisible}>
        <div className={"mb-[0.9375rem] lg:mb-[1.875rem]"}>
          <div
            className={
              "card flex flex-col lg:flex-row lg:justify-between bg-danger gap-[0.9375rem] px-[0.9375rem] py-[1.125rem]"
            }
          >
            <div className={"flex-1 flex items-center"}>{t(localeKeys.switchAccountNotice)}</div>
            <div>
              <Button onClick={onSwitchNetwork} className={"bg-white text-danger lg:h-[1.875rem] h-[2.5rem]"}>
                {t(localeKeys.switchNetwork)}
              </Button>
            </div>
          </div>
        </div>
      </SlideDownUp>
      <div className={"mb-[0.9375rem] lg:mb-[1.875rem]"}>
        <Account advanced={true} relayerAddress={testRelayerAddress} />
      </div>
      <div className={"mb-[0.9375rem] lg:mb-[1.875rem]"}>
        <Balance relayerAddress={testRelayerAddress} />
      </div>
      {/*Charts*/}
      <div className={"mb-[0.9375rem] lg:mb-[1.875rem]"}>
        <RelayerDetailsChart
          currentMarket={currentMarket}
          rewardsData={rewardAndSlashData?.rewards || []}
          slashesData={rewardAndSlashData?.slashs || []}
          quoteHistoryData={quoteHistoryData || []}
        />
      </div>

      {/*Relayer Orders table*/}
      <div>
        <RelayerDetailsTable
          relatedOrdersData={relayerRelatedOrdersData}
          tokenSymbol={nativeToken?.symbol}
          tokenDecimals={nativeToken?.decimals}
        />
      </div>
    </div>
  );
};

export default RelayerDashboard;
