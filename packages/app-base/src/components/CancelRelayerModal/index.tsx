import { ModalEnhanced } from "@darwinia/ui";
import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import { useCallback } from "react";
import AccountMini from "../AccountMini";

import { Contract } from "ethers";
import { useFeeMarket, useApi } from "@feemarket/app-provider";
import { ETH_CHAIN_CONF } from "@feemarket/app-config";
import {
  isEthApi,
  isPolkadotApi,
  isEthChain,
  isPolkadotChain,
  signAndSendTx,
  triggerContract,
  getQuotePrev,
  getFeeMarketApiSection,
  CallbackType,
} from "@feemarket/app-utils";

interface Props {
  isVisible: boolean;
  relayerAddress: string;
  onClose: () => void;
}

const CancelRelayerModal = ({ isVisible, relayerAddress, onClose }: Props) => {
  const { t } = useTranslation();
  const { currentMarket } = useFeeMarket();
  const { api } = useApi();

  const sourceChain = currentMarket?.source;
  const destinationChain = currentMarket?.destination;

  const handleConfirm = useCallback(async () => {
    if (isEthChain(sourceChain) && isEthApi(api)) {
      const chainConfig = ETH_CHAIN_CONF[sourceChain];
      const contract = new Contract(chainConfig.contractAddress, chainConfig.contractInterface, api.getSigner());

      const { prevOld } = await getQuotePrev(contract, relayerAddress);

      const callback: CallbackType = {
        errorCallback: ({ error }) => {
          console.error("cancel relayer:", error);
        },
        responseCallback: ({ response }) => {
          onClose();
          console.log("cancel relayer response:", response);
        },
        successCallback: ({ receipt }) => {
          console.log("cancel relayer receipt:", receipt);
        },
      };

      triggerContract(contract, "leave", [prevOld], callback);
    } else if (isPolkadotChain(destinationChain) && isPolkadotApi(api)) {
      const apiSection = getFeeMarketApiSection(api, destinationChain);
      if (apiSection) {
        const extrinsic = api.tx[apiSection].cancelEnrollment();

        signAndSendTx({
          extrinsic,
          requireAddress: relayerAddress,
          txUpdateCb: onClose,
          txFailedCb: (error) => console.error(error),
        });
      }
    }
  }, [sourceChain, destinationChain, api]);

  return (
    <ModalEnhanced
      onCancel={onClose}
      onClose={onClose}
      cancelText={t(localeKeys.cancel)}
      confirmText={t(localeKeys.confirm)}
      onConfirm={handleConfirm}
      isVisible={isVisible}
      modalTitle={t(localeKeys.confirmCancelRelayer)}
    >
      <div className={"flex flex-col gap-[1.25rem]"}>
        <div className={"flex flex-col gap-[0.625rem]"}>
          <div className={"text-12-bold"}>{t(localeKeys.account)}</div>
          <AccountMini address={relayerAddress} />
        </div>
        {/*warning*/}
        <div className={"flex flex-col gap-[0.625rem]"}>
          {t(localeKeys.cancelRelayerWarning, { from: sourceChain, to: destinationChain })}
        </div>
        <div className={"bg-divider w-full h-[1px]"} />
      </div>
    </ModalEnhanced>
  );
};

export default CancelRelayerModal;
