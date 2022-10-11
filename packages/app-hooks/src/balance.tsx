import { BigNumber, providers } from "ethers";
import { BN } from "@polkadot/util";
import { from, Subscription } from "rxjs";
import { ApiPromise } from "@polkadot/api";

import type { BalanceResult } from "@feemarket/app-utils";
import { getEthBalance, getPolkadotBalance, isEthApi, isPolkadotApi } from "@feemarket/app-utils";
import { useEffect, useState } from "react";

export const useBalance = (api: providers.Provider | ApiPromise | null, address: string) => {
  const [balance, setBalance] = useState<BalanceResult<BigNumber | BN | null>>({ total: null, available: null });

  useEffect(() => {
    let sub$$: Subscription;

    if (address) {
      if (isEthApi(api)) {
        sub$$ = from(getEthBalance(api, address)).subscribe({
          next: setBalance,
          error: (error) => {
            setBalance({ total: null, available: null });
            console.error("get eth balance:", error);
          },
        });
      } else if (isPolkadotApi(api)) {
        sub$$ = from(getPolkadotBalance(api, address)).subscribe({
          next: setBalance,
          error: (error) => {
            setBalance({ total: null, available: null });
            console.error("get polkadot balance:", error);
          },
        });
      } else {
        setBalance({ total: null, available: null });
      }
    } else {
      setBalance({ total: null, available: null });
    }

    return () => {
      if (sub$$) {
        sub$$.unsubscribe();
      }
    };
  }, [api, address]);

  return { balance };
};
