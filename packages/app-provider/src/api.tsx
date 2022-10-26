import { ApiPromise, WsProvider } from "@polkadot/api";
import { providers, BigNumber } from "ethers";
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useState } from "react";
import { useFeeMarket } from "./feemarket";
import { ETH_CHAIN_CONF, POLKADOT_CHAIN_CONF, DAPP_NAME } from "@feemarket/app-config";
import type { FeeMarketSourceChainEth, FeeMarketSourceChainPolkadot } from "@feemarket/app-types";
import { isEthApi, isPolkadotApi } from "@feemarket/app-utils";
import { from, Subscription } from "rxjs";
import { web3Accounts, web3Enable } from "@polkadot/extension-dapp";
import type { u16 } from "@polkadot/types";
import { encodeAddress } from "@polkadot/util-crypto";
import keyring from "@polkadot/ui-keyring";

export interface ApiCtx {
  api: providers.Web3Provider | ApiPromise | null;
  accounts: string[] | null;
  currentAccount: string | null;
  accountBalance: BigNumber;
  currentChainId: number | null;
  requestAccounts: () => Promise<void>;
  setCurrentAccount: (account: string) => void;
}

const defaultValue: ApiCtx = {
  api: null,
  accounts: null,
  currentAccount: null,
  currentChainId: null,
  accountBalance: BigNumber.from(0),
  requestAccounts: async () => undefined,
  setCurrentAccount: () => undefined,
};

export const ApiContext = createContext<ApiCtx>(defaultValue);

export const ApiProvider = ({ children }: PropsWithChildren<unknown>) => {
  const { currentMarket } = useFeeMarket();
  const [api, setApi] = useState<providers.Web3Provider | ApiPromise | null>(null);
  const [accounts, setAccounts] = useState<string[] | null>(null);
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [accountBalance, setAccountBalance] = useState<BigNumber>(BigNumber.from(0));
  const [currentChainId, setCurrentChainId] = useState<number | null>(null);

  const requestAccounts = useCallback(async () => {
    if (isEthApi(api)) {
      const allAccounts = await api.send("eth_requestAccounts", []);
      setAccounts(allAccounts);
      setCurrentAccount(allAccounts.length ? allAccounts[0] : null);
    } else if (isPolkadotApi(api)) {
      await web3Enable(DAPP_NAME);

      const ss58Prefix = (api.consts.system.ss58Prefix as u16).toNumber();
      const allAccounts = (await web3Accounts()).map((item) => ({
        ...item,
        address: encodeAddress(item.address, ss58Prefix),
      }));

      allAccounts.forEach((item) => {
        keyring.saveAddress(item.address, item.meta);
      });

      setAccounts(allAccounts.map((item) => item.address));
      setCurrentAccount(allAccounts.length ? allAccounts[0].address : null);
    } else {
      setAccounts(null);
      setCurrentAccount(null);
    }
  }, [api]);

  useEffect(() => {
    setApi(null);
    setAccounts(null);
    setCurrentAccount(null);

    if (currentMarket?.source) {
      if (ETH_CHAIN_CONF[currentMarket.source as FeeMarketSourceChainEth]) {
        if (typeof window.ethereum !== "undefined") {
          setApi(new providers.Web3Provider(window.ethereum));

          window.ethereum.on("chainChanged", () => {
            setApi(new providers.Web3Provider(window.ethereum));
          });

          window.ethereum.on("accountsChanged", (accs: string[]) => {
            setAccounts(accs);
            setCurrentAccount(null);
          });
        }
      } else if (POLKADOT_CHAIN_CONF[currentMarket.source as FeeMarketSourceChainPolkadot]) {
        const provider = new WsProvider(
          POLKADOT_CHAIN_CONF[currentMarket.source as FeeMarketSourceChainPolkadot].provider.rpc
        );
        const api = new ApiPromise({ provider });
        api.on("error", () => {
          setApi(null);
        });
        api.on("ready", () => {
          setApi((prev) => prev ?? api);
        });
        api.on("disconnected", () => {
          setApi(null);
        });
      }
    }

    return () => {
      api?.off("error", () => undefined);
      api?.off("ready", () => undefined);
      api?.off("connected", () => undefined);
      api?.off("disconnected", () => undefined);
    };
  }, [currentMarket]);

  useEffect(() => {
    let sub$$: Subscription;

    if (isEthApi(api)) {
      sub$$ = from(api.getNetwork()).subscribe(({ chainId }) => {
        setCurrentChainId(chainId);
      });
    } else if (isPolkadotApi(api)) {
      setCurrentChainId(null);
    } else {
      setCurrentChainId(null);
    }

    return () => {
      if (sub$$) {
        sub$$.unsubscribe();
      }
    };
  }, [api]);

  useEffect(() => {
    let sub$$: Subscription;

    if (api && accounts?.length) {
      if (isEthApi(api)) {
        sub$$ = from(api.getBalance(accounts[0])).subscribe(setAccountBalance);
      } else if (isPolkadotApi(api)) {
        // TODO
      } else {
        setAccountBalance(BigNumber.from(0));
      }
    } else {
      setAccountBalance(BigNumber.from(0));
    }

    return () => {
      if (sub$$) {
        sub$$.unsubscribe();
      }
    };
  }, [api, accounts]);

  return (
    <ApiContext.Provider
      value={{
        api,
        accounts,
        currentAccount,
        accountBalance,
        currentChainId,
        requestAccounts,
        setCurrentAccount,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => useContext(ApiContext);
