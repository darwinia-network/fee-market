import { web3Enable, web3Accounts } from "@polkadot/extension-dapp";
import type { u16 } from "@polkadot/types";
import { encodeAddress } from "@polkadot/util-crypto";
import type { Account, Wallet } from "../../types";
import logo from "../../assets/images/wallet/polkadot-js.svg";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useApi } from "../api";
import { isPolkadotApi } from "../../utils";

const DAPP_NAME = "darwinia/feemarket";

export const usePolkadotJs = (): Wallet => {
  const { providerApi, setAccounts, setActiveWallet } = useApi();
  const [loading, setLoading] = useState(false);

  const installed = useMemo(() => {
    const injecteds = window.injectedWeb3;
    return injecteds &&
      (injecteds["polkadot-js"] ||
        injecteds['"polkadot-js"'] ||
        injecteds["talisman"] ||
        injecteds['"talisman"'] ||
        injecteds["subwallet-js"] ||
        injecteds['"subwallet-js"'])
      ? true
      : false;
  }, []);

  const connect = useCallback(async () => {
    if (isPolkadotApi(providerApi)) {
      setLoading(true);
      await web3Enable(DAPP_NAME);

      const ss58Prefix = (providerApi.consts.system.ss58Prefix as u16).toNumber();
      const accounts = (await web3Accounts()).map(
        ({ address, meta }) =>
          ({
            address: encodeAddress(address, ss58Prefix),
            originAddress: address,
            meta,
          } as Account)
      );
      setLoading(false);

      setAccounts(accounts);
      setActiveWallet("polkadot-js");
    }
  }, [providerApi, setAccounts, setActiveWallet]);

  const disconnect = useCallback(() => {
    setActiveWallet(null);
  }, [setActiveWallet]);

  useEffect(() => {
    disconnect();
  }, [disconnect]);

  return { id: "polkadot-js", installed, logo, loading, name: "Polkadot.{js}", connect, disconnect };
};
