import { ModalEnhanced, notification } from "@darwinia/ui";
import { useTranslation, TFunction } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import { useCallback, useMemo, useState } from "react";
import AccountMini from "../AccountMini";
import { Contract } from "ethers";
import { useFeeMarket, useApi } from "@feemarket/app-provider";
import { ETH_CHAIN_CONF, POLKADOT_CHAIN_CONF } from "@feemarket/app-config";
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

const notifyTx = (
  t: TFunction,
  {
    type,
    msg,
    hash,
    explorer,
  }: {
    type: "error" | "success";
    msg?: string;
    hash?: string;
    explorer?: string;
  }
) => {
  notification[type]({
    message: (
      <div className="flex flex-col gap-1.5">
        <h5 className="capitalize text-14-bold">
          {type === "success" ? t(localeKeys.successed) : t(localeKeys.failed)}
        </h5>
        {hash && explorer ? (
          <a
            className="text-12 underline text-primary break-all hover:opacity-80"
            rel="noopener noreferrer"
            target={"_blank"}
            href={`${explorer}tx/${hash}`}
          >
            {hash}
          </a>
        ) : (
          <p className="text-12 break-all">{msg}</p>
        )}
      </div>
    ),
  });
};

interface Props {
  isVisible: boolean;
  relayerAddress: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const CancelRelayerModal = ({ isVisible, relayerAddress, onClose, onSuccess = () => undefined }: Props) => {
  const { t } = useTranslation();
  const { currentMarket } = useFeeMarket();
  const { signerApi: api } = useApi();
  const [busy, setBusy] = useState(false);

  const sourceChain = currentMarket?.source;
  const destinationChain = currentMarket?.destination;

  const loadingModal = useMemo(() => {
    return !relayerAddress || !currentMarket || !api;
  }, [relayerAddress, currentMarket, api]);

  const handleConfirm = useCallback(async () => {
    if (isEthChain(sourceChain) && isEthApi(api)) {
      setBusy(true);

      const chainConfig = ETH_CHAIN_CONF[sourceChain];
      const contract = new Contract(chainConfig.contractAddress, chainConfig.contractInterface, api.getSigner());

      const { prevOld } = await getQuotePrev(contract, relayerAddress);

      const callback: CallbackType = {
        errorCallback: ({ error }) => {
          if (error instanceof Error) {
            notifyTx(t, {
              type: "error",
              msg: error.message,
            });
          } else {
            notifyTx(t, {
              type: "error",
              msg: t("Transaction sending failed"),
            });
          }
          setBusy(false);
          console.error("cancel relayer:", error);
        },
        responseCallback: ({ response }) => {
          console.log("cancel relayer response:", response);
        },
        successCallback: ({ receipt }) => {
          notifyTx(t, {
            type: "success",
            explorer: chainConfig.explorer.url,
            hash: receipt.transactionHash,
          });
          onClose();
          onSuccess();
          setBusy(false);
          console.log("cancel relayer receipt:", receipt);
        },
      };

      triggerContract(contract, "leave", [prevOld], callback);
    } else if (isPolkadotChain(sourceChain) && isPolkadotChain(destinationChain) && isPolkadotApi(api)) {
      const chainConfig = POLKADOT_CHAIN_CONF[sourceChain];
      const apiSection = getFeeMarketApiSection(api, destinationChain);

      if (apiSection) {
        setBusy(true);
        const extrinsic = api.tx[apiSection].cancelEnrollment();

        signAndSendTx({
          extrinsic,
          requireAddress: relayerAddress,
          txSuccessCb: (result) => {
            notifyTx(t, {
              type: "success",
              explorer: chainConfig.explorer.url,
              hash: result.txHash.toHex(),
            });
            onClose();
            onSuccess();
            setBusy(false);
          },
          txFailedCb: (error) => {
            if (error) {
              if (error instanceof Error) {
                notifyTx(t, { type: "error", msg: error.message });
              } else {
                notifyTx(t, { type: "error", explorer: chainConfig.explorer.url, hash: error.txHash.toHex() });
              }
            } else {
              notifyTx(t, { type: "error", msg: t("Transaction sending failed") });
            }
            setBusy(false);
            console.error(error);
          },
        });
      }
    }
  }, [sourceChain, destinationChain, api, relayerAddress, onSuccess]);

  return (
    <ModalEnhanced
      onCancel={onClose}
      onClose={onClose}
      cancelText={t(localeKeys.cancel)}
      confirmText={t(localeKeys.confirm)}
      onConfirm={handleConfirm}
      isVisible={isVisible}
      isLoading={loadingModal}
      confirmLoading={busy}
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
