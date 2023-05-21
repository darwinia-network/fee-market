import { BN, BN_ZERO } from "@polkadot/util";
import { useEffect, useState } from "react";
import { Subscription, from } from "rxjs";
import { useMarket } from "./market";
import { useApi } from "../providers";
import {
  getEthChainConfig,
  getFeeMarketApiSection,
  isEthChain,
  isEthProviderApi,
  isPolkadotApi,
  isPolkadotChain,
} from "../utils";
import type { Vec, Option } from "@polkadot/types";
import type { PalletFeeMarketRelayer } from "../types";

interface State {
  value: BN | bigint | null | undefined;
  loading: boolean;
}

export const useCurrentFee = () => {
  const { sourceChain, destinationChain } = useMarket();
  const { providerApi: api } = useApi();

  const [currentFee, setCurrentFee] = useState<State>({
    value: null,
    loading: false,
  });

  useEffect(() => {
    let sub$$: Subscription | null = null;

    if (isEthProviderApi(api) && isEthChain(sourceChain)) {
      const { contractAddress, contractInterface } = getEthChainConfig(sourceChain);
      setCurrentFee((prev) => ({ ...prev, loading: true }));

      sub$$ = from(
        api.readContract({
          address: contractAddress,
          abi: contractInterface,
          functionName: "market_fee",
        }) as Promise<bigint>
      ).subscribe({
        next: (res) => {
          setCurrentFee({
            value: res,
            loading: false,
          });
        },
        complete: () => setCurrentFee((prev) => ({ ...prev, loading: false })),
        error: () => setCurrentFee({ value: null, loading: false }),
      });
    } else if (isPolkadotApi(api) && isPolkadotChain(destinationChain)) {
      const apiSection = getFeeMarketApiSection(api, destinationChain);

      if (apiSection) {
        setCurrentFee((prev) => ({ ...prev, loading: true }));

        sub$$ = from(api.query[apiSection].assignedRelayers<Option<Vec<PalletFeeMarketRelayer>>>()).subscribe({
          next: (res) => {
            if (res.isSome) {
              const lastOne = res.unwrap().pop();
              setCurrentFee({ loading: false, value: lastOne?.fee });
            } else {
              setCurrentFee({ loading: false, value: BN_ZERO });
            }
          },
          complete: () => setCurrentFee((prev) => ({ ...prev, loading: false })),
          error: () => setCurrentFee({ value: null, loading: false }),
        });
      }
    }

    return () => {
      sub$$?.unsubscribe();
      setCurrentFee({ value: null, loading: false });
    };
  }, [api, sourceChain, destinationChain]);

  return { currentFee };
};
