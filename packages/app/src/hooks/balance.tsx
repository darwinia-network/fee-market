import { BigNumber } from "ethers";
import { from, EMPTY } from "rxjs";
import { useCallback, useEffect, useState } from "react";
import { BN } from "@polkadot/util";
import { getPolkadotBalance, isPolkadotApi, getEthBalance, isEthersApi } from "../utils";
import { useApi } from "./api";
import type { BalanceResult } from "../types";

export const useBalance = (address: string) => {
  const { providerApi: api } = useApi();
  const [balance, setBalance] = useState<BalanceResult<BigNumber | BN | null> & { loading: boolean }>({
    total: null,
    available: null,
    loading: false,
  });

  const getBalance = useCallback(() => {
    if (isEthersApi(api)) {
      setBalance((prev) => ({ ...prev, loading: true }));

      return from(getEthBalance(api, address)).subscribe({
        next: ({ total, available }) => {
          setBalance({ total, available, loading: false });
        },
        error: (error) => {
          console.error("get eth balance:", error);
          setBalance({ total: null, available: null, loading: false });
        },
      });
    } else if (isPolkadotApi(api)) {
      setBalance((prev) => ({ ...prev, loading: true }));

      return from(getPolkadotBalance(api, address)).subscribe({
        next: ({ total, available }) => {
          setBalance({ total, available, loading: false });
        },
        error: (error) => {
          console.error("get polkadot balance:", error);
          setBalance({ total: null, available: null, loading: false });
        },
      });
    }

    return EMPTY.subscribe();
  }, [api, address]);

  useEffect(() => {
    const sub$$ = getBalance();
    return () => {
      sub$$.unsubscribe();
      setBalance({ total: null, available: null, loading: false });
    };
  }, [getBalance]);

  return { balance, refresh: getBalance };
};
