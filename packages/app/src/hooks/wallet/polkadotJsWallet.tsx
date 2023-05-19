import { web3Enable, web3Accounts } from "@polkadot/extension-dapp";
import type { u16 } from "@polkadot/types";
import { encodeAddress } from "@polkadot/util-crypto";
import type { Account } from "../../types";
import logo from "../../assets/images/polkadot-logo.svg";
import { useCallback } from "react";
import { useApi } from "../api";
import { isPolkadotApi } from "../../utils";

const DAPP_NAME = "darwinia/feemarket";

export const usePolkadotJsWallet = () => {
  const { signerApi, setAccounts } = useApi();

  const connect = useCallback(async () => {
    if (isPolkadotApi(signerApi)) {
      await web3Enable(DAPP_NAME);

      const ss58Prefix = (signerApi.consts.system.ss58Prefix as u16).toNumber();
      const accounts = (await web3Accounts()).map(
        ({ address, meta }) =>
          ({
            address: encodeAddress(address, ss58Prefix),
            originAddress: address,
            meta,
          } as Account)
      );

      setAccounts(accounts);
    }
  }, [signerApi, setAccounts]);

  const disconnect = useCallback(() => {
    // TODO
  }, []);

  return { logo, connect, disconnect };
};
