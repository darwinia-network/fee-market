import { ModalEnhanced } from "@darwinia/ui";
import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import { useCallback, useMemo, useState } from "react";
import AccountMini from "../AccountMini";
import { useRelayer, useBalance, useMarket, useApi } from "../../hooks";
import { isPolkadotChain } from "../../utils";

const CancelRelayerModal = ({ isVisible, onClose }: { isVisible: boolean; onClose: () => void }) => {
  const { t } = useTranslation();
  const { currentMarket } = useMarket();
  const { signerApi: api } = useApi();
  const { relayerAddress, cancel } = useRelayer();
  const { refresh: refreshBalance } = useBalance(relayerAddress);
  const [busy, setBusy] = useState(false);

  const sourceChain = currentMarket?.source;
  const destinationChain = currentMarket?.destination;

  const loadingModal = useMemo(() => {
    return !relayerAddress || !currentMarket || (isPolkadotChain(sourceChain) && !api);
  }, [relayerAddress, currentMarket, api, sourceChain]);

  const handleConfirm = useCallback(async () => {
    setBusy(true);
    cancel(
      () => {
        setBusy(false);
      },
      () => {
        refreshBalance();
        setBusy(false);
        onClose();
      }
    );
  }, [cancel, onClose, refreshBalance]);

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
