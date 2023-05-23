import { useEffect, useState } from "react";
import { Subscription, from, switchMap, zip, of, forkJoin, Observable } from "rxjs";
import { useApi } from "../providers";
import { useMarket } from "./market";
import {
  getEthChainConfig,
  getFeeMarketApiSection,
  isEthChain,
  isEthersApi,
  isPolkadotApi,
  isPolkadotChain,
  isVec,
  isOption,
} from "../utils";
import type { OrderBook, PalletFeeMarketRelayer } from "../types";
import type { Vec, u128, Option } from "@polkadot/types";
import type { AccountId32 } from "@polkadot/types/interfaces";
import { BigNumber, Contract } from "ethers";

interface State {
  total: number | null | undefined;
  active: number | null | undefined;
  loading: boolean;
}

export const useRelayerAmount = () => {
  const { sourceChain, destinationChain } = useMarket();
  const { providerApi: api } = useApi();
  const [relayerAmount, setRelayerAmount] = useState<State>({ total: null, active: null, loading: false });

  useEffect(() => {
    let sub$$: Subscription | null = null;

    if (isEthChain(sourceChain) && isEthersApi(api)) {
      const chainConfig = getEthChainConfig(sourceChain);
      const contract = new Contract(chainConfig.contractAddress, chainConfig.contractInterface, api);

      setRelayerAmount((prev) => ({ ...prev, loading: true }));

      sub$$ = from(contract.relayerCount() as Promise<BigNumber>)
        .pipe(
          switchMap((relayerCount) =>
            zip(of(relayerCount), from(contract.getOrderBook(relayerCount, false) as Promise<OrderBook>))
          )
        )
        .subscribe({
          next: ([relayerCount, orderBook]) => {
            setRelayerAmount({
              active: orderBook[1].length,
              total: relayerCount.toNumber(),
              loading: false,
            });
          },
          error: () => setRelayerAmount({ active: null, total: null, loading: false }),
        });
    } else if (isPolkadotChain(destinationChain) && isPolkadotApi(api)) {
      const apiSection = getFeeMarketApiSection(api, destinationChain);
      if (apiSection) {
        setRelayerAmount((prev) => ({ ...prev, loading: true }));

        sub$$ = from(api.query[apiSection].relayers<Vec<AccountId32> | Option<Vec<AccountId32>>>())
          .pipe(
            switchMap((res) => {
              if (isVec<AccountId32>(res)) {
                return of(res);
              } else if (isOption<Vec<AccountId32>>(res) && res.isSome) {
                return of(res.unwrap());
              }
              return of([]);
            }),
            switchMap((total) =>
              forkJoin(
                total.map((relayer) =>
                  api.query[apiSection].relayersMap<PalletFeeMarketRelayer | Option<PalletFeeMarketRelayer>>(relayer)
                )
              )
            ),
            switchMap(
              (res) =>
                of(
                  res
                    .map((item) => {
                      if (isOption<PalletFeeMarketRelayer>(item)) {
                        if (item.isSome) {
                          return item.unwrap();
                        } else {
                          return null;
                        }
                      }
                      return item as PalletFeeMarketRelayer;
                    })
                    .filter((item) => item !== null)
                ) as Observable<PalletFeeMarketRelayer[]>
            )
          )
          .subscribe({
            next: (relayers) => {
              let active = 0;
              const collateralPerOrder = api.consts[apiSection].collateralPerOrder as u128;

              relayers.forEach((relayer) => {
                if (relayer.collateral.gte(collateralPerOrder)) {
                  active++;
                }
              });

              setRelayerAmount({
                active,
                total: relayers.length,
                loading: false,
              });
            },
            error: () => setRelayerAmount({ active: null, total: null, loading: false }),
          });
      }
    }

    return () => {
      sub$$?.unsubscribe();
      setRelayerAmount({ total: null, active: null, loading: false });
    };
  }, [api, sourceChain, destinationChain]);

  return { relayerAmount };
};
