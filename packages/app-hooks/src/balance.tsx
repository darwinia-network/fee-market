import { BigNumber, providers } from "ethers";
import { BN } from "@polkadot/util";
import { from, EMPTY } from "rxjs";
import { ApiPromise } from "@polkadot/api";

import type { BalanceResult } from "@feemarket/app-utils";
import { getEthBalance, getPolkadotBalance, isEthApi, isPolkadotApi } from "@feemarket/app-utils";
import { useCallback, useEffect, useState } from "react";

export const useBalance = (api: providers.Provider | ApiPromise | null, address: string) => {
  const [balance, setBalance] = useState<BalanceResult<BigNumber | BN | null>>({ total: null, available: null });

  const getBalance = useCallback(() => {
    if (address) {
      if (isEthApi(api)) {
        setBalance((prev) => ({ ...prev, loading: true }));

        return from(getEthBalance(api, address)).subscribe({
          next: ({ total, available }) => {
            setBalance({ total, available, loading: false });
          },
          error: (error) => {
            setBalance({ total: null, available: null, loading: false });
            console.error("get eth balance:", error);
          },
        });
      } else if (isPolkadotApi(api)) {
        setBalance((prev) => ({ ...prev, loading: true }));

        return from(getPolkadotBalance(api, address)).subscribe({
          next: ({ total, available }) => {
            setBalance({ total, available, loading: false });
          },
          error: (error) => {
            setBalance({ total: null, available: null, loading: false });
            console.error("get polkadot balance:", error);
          },
        });
      }
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
