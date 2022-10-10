import { ModalEnhanced } from "@darwinia/ui";
import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import { useEffect, useState } from "react";
import AccountMini from "../AccountMini";

import { BigNumber, Contract } from "ethers";
import { useFeeMarket, useApi } from "@feemarket/app-provider";
import { ETH_CHAIN_CONF } from "@feemarket/app-config";
import {
  isEthApi,
  isPolkadotApi,
  isEthChain,
  isPolkadotChain,
  triggerContract,
  getFeeMarketApiSection,
} from "@feemarket/app-utils";
import { from, switchMap, forkJoin } from "rxjs";
import { web3FromAddress } from "@polkadot/extension-dapp";

const SENTINEL_HEAD = "0x0000000000000000000000000000000000000001";

export interface CancelRelayerModalProps {
  isVisible: boolean;
  relayerAddress: string;
  onClose: () => void;
}

const CancelRelayerModal = ({ isVisible, relayerAddress, onClose }: CancelRelayerModalProps) => {
  const { t } = useTranslation();
  const { currentMarket } = useFeeMarket();
  const { api } = useApi();
  const [isModalVisible, setModalVisibility] = useState(false);

  useEffect(() => {
    setModalVisibility(isVisible);
  }, [isVisible]);

  const onCloseModal = () => {
    setModalVisibility(false);
    onClose();
  };

  const onCancelModal = () => {
    onCloseModal();
  };

  const onConfirm = () => {
    if (currentMarket?.source && isEthChain(currentMarket.source) && isEthApi(api)) {
      const chainConfig = ETH_CHAIN_CONF[currentMarket.source];
      const contract = new Contract(chainConfig.contractAddress, chainConfig.contractInterface, api.getSigner());

      from(contract.relayerCount() as Promise<BigNumber>)
        .pipe(
          switchMap((relayerCount) =>
            forkJoin(
              new Array(relayerCount.toNumber())
                .fill(0)
                .map(
                  (_, index) =>
                    contract.getOrderBook(index + 1, true) as Promise<
                      [BigNumber, string[], BigNumber[], BigNumber[], BigNumber[]]
                    >
                )
            )
          )
        )
        .subscribe({
          next: (book) => {
            const oldIndex = book.findIndex((item) => item[1].some((item) => item === relayerAddress));
            let oldPrev: string | null = null;
            if (oldIndex === 0) {
              oldPrev = SENTINEL_HEAD;
            } else if (oldIndex > 0) {
              oldPrev = book[oldIndex - 1][1][0];
            }

            triggerContract(contract, "leave", [oldPrev], {
              errorCallback: ({ error }) => {
                console.error("call leave:", error);
              },
              responseCallback: ({ response }) => {
                onCloseModal();
                console.log("call leave response:", response);
              },
              successCallback: ({ receipt }) => {
                console.log("call leave receipt:", receipt);
              },
            });
          },
          error: (error) => {
            console.error("leave relayer:", error);
            onCloseModal();
          },
          complete: () => {
            onCloseModal();
          },
        });
    } else if (currentMarket?.destination && isPolkadotChain(currentMarket.destination) && isPolkadotApi(api)) {
      const apiSection = getFeeMarketApiSection(api, currentMarket.destination);
      if (apiSection) {
        const extrinsic = api.tx[apiSection].cancelEnrollment();
        from(web3FromAddress(relayerAddress))
          .pipe(switchMap((injector) => from(extrinsic.signAndSend(relayerAddress, { signer: injector.signer }))))
          .subscribe({
            next: (result) => {
              console.log("cancel enrollment:", result.toString());
            },
            error: (error) => {
              onCloseModal();
              console.error("cancel enrollment:", error);
            },
            complete: () => {
              onCloseModal();
            },
          });
      }
    } else {
      onCloseModal();
    }
  };

  return (
    <ModalEnhanced
      onCancel={onCancelModal}
      onClose={onCloseModal}
      cancelText={t(localeKeys.cancel)}
      confirmText={t(localeKeys.confirm)}
      onConfirm={onConfirm}
      isVisible={isModalVisible}
      modalTitle={t(localeKeys.confirmCancelRelayer)}
    >
      <div className={"flex flex-col gap-[1.25rem]"}>
        <div className={"flex flex-col gap-[0.625rem]"}>
          <div className={"text-12-bold"}>{t(localeKeys.account)}</div>
          <AccountMini address={relayerAddress} />
        </div>
        {/*warning*/}
        <div className={"flex flex-col gap-[0.625rem]"}>{t(localeKeys.cancelRelayerWarning)}</div>

        <div className={"bg-divider w-full h-[1px]"} />

        {/* <div className={"flex flex-col gap-[0.625rem]"}>{t(localeKeys.feeEstimation, { amount: "0.12551 RING" })}</div> */}
      </div>
    </ModalEnhanced>
  );
};

export default CancelRelayerModal;
