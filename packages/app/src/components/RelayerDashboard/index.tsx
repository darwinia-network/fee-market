import Account from "../Account";
import Balance from "../Balance";
import RelayerDetailsChart from "../RelayerDetailsChart";
import RelayerDetailsTable from "../RelayerDetailsTable";
import { Button, SlideDownUp } from "@darwinia/ui";
import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import { useCallback, useEffect, useState, useMemo } from "react";
import type { Option } from "@polkadot/types";
import type { PalletFeeMarketRelayer } from "@feemarket/types";
import { BN_ZERO } from "@polkadot/util";
import { useMarket } from "@feemarket/market";
import { useApi } from "@feemarket/api";
import { useRelayerDetailData } from "@feemarket/hooks";
import {
  isEthApi,
  isEthChain,
  isPolkadotApi,
  isPolkadotChain,
  getFeeMarketApiSection,
  isOption,
  getEthChainConfig,
  getPolkadotChainConfig,
} from "@feemarket/utils";
import { utils as ethersUtils, Contract } from "ethers";
import { from, EMPTY } from "rxjs";

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

interface Props {
  relayerAddress: string;
}

const RelayerDashboard = ({ relayerAddress }: Props) => {
  const { t } = useTranslation();
  const { currentMarket } = useMarket();
  const { signerApi: api, currentChainId } = useApi();
  const { rewardAndSlashData, quoteHistoryData, relayerRelatedOrdersData } = useRelayerDetailData({
    relayerAddress: relayerAddress.startsWith("0x") ? relayerAddress.toLowerCase() : relayerAddress,
  });
  const [isRegistered, setRegistered] = useState(false);
  const [isNotificationVisible, setNotificationVisibility] = useState(false);

  const sourceChain = currentMarket?.source;
  const destinationChain = currentMarket?.destination;

  const nativeToken = useMemo(() => {
    if (isEthChain(sourceChain)) {
      return getEthChainConfig(sourceChain).nativeToken;
    } else if (isPolkadotChain(sourceChain)) {
      return getPolkadotChainConfig(sourceChain).nativeToken;
    }
    return null;
  }, [sourceChain]);

  const onSwitchNetwork = async () => {
    if (sourceChain && isEthChain(sourceChain) && isEthApi(api)) {
      const chainConfig = getEthChainConfig(sourceChain);
      const chainId = ethersUtils.hexValue(chainConfig.chainId);

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
    }
  };

  const onShowNotification = () => {
    setNotificationVisibility(true);
  };

  const onHideNotification = () => {
    setNotificationVisibility(false);
  };

  useEffect(() => {
    if (sourceChain && isEthChain(sourceChain) && getEthChainConfig(sourceChain).chainId !== currentChainId) {
      onShowNotification();
    } else {
      onHideNotification();
    }
  }, [sourceChain, currentChainId]);

  const checkRegistered = useCallback(() => {
    if (isEthChain(sourceChain) && isEthApi(api) && !isNotificationVisible) {
      const chainConfig = getEthChainConfig(sourceChain);
      const contract = new Contract(chainConfig.contractAddress, chainConfig.contractInterface, api);

      return from(contract.isRelayer(relayerAddress) as Promise<boolean>).subscribe({
        next: setRegistered,
        error: (error) => {
          setRegistered(false);
          console.error("check registered:", error);
        },
      });
    } else if (isPolkadotChain(destinationChain) && isPolkadotApi(api)) {
      const apiSection = getFeeMarketApiSection(api, destinationChain);
      if (apiSection) {
        return from(
          api.query[apiSection].relayersMap<PalletFeeMarketRelayer | Option<PalletFeeMarketRelayer>>(relayerAddress)
        ).subscribe({
          next: (res) => {
            if (isOption(res)) {
              if (res.isSome) {
                const { fee, collateral } = res.unwrap();
                if (fee.gt(BN_ZERO) || collateral.gt(BN_ZERO)) {
                  setRegistered(true);
                } else {
                  setRegistered(false);
                }
              } else {
                setRegistered(false);
              }
            } else if (
              res &&
              ((res as PalletFeeMarketRelayer).fee.gt(BN_ZERO) ||
                (res as PalletFeeMarketRelayer).collateral.gt(BN_ZERO))
            ) {
              setRegistered(true);
            } else {
              setRegistered(false);
            }
          },
          error: (error) => {
            console.error("check registered:", error);
          },
        });
      }
    }

    return EMPTY.subscribe();
  }, [sourceChain, destinationChain, api, relayerAddress, isNotificationVisible]);

  useEffect(() => {
    const sub$$ = checkRegistered();
    return () => {
      sub$$.unsubscribe();
      setRegistered(false);
    };
  }, [checkRegistered]);

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
              <Button
                onClick={onSwitchNetwork}
                className={"!bg-white w-full !text-danger !text-14-bold lg:!h-[1.875rem]"}
              >
                {t(localeKeys.switchNetwork)}
              </Button>
            </div>
          </div>
        </div>
      </SlideDownUp>
      <div className={"mb-[0.9375rem] lg:mb-[1.875rem]"}>
        <Account
          advanced={!isNotificationVisible}
          relayerAddress={relayerAddress}
          isRegistered={isRegistered}
          sourceChain={currentMarket?.source}
          onSuccess={checkRegistered}
        />
      </div>
      <div className={"mb-[0.9375rem] lg:mb-[1.875rem]"}>
        <Balance relayerAddress={relayerAddress} registered={isRegistered} matchNetwork={!isNotificationVisible} />
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
