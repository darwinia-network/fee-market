import { BigNumber, Contract } from "ethers";
import { useEffect, useState } from "react";
import { from, switchMap, forkJoin, map, zip, of, Observable, Subscription, catchError } from "rxjs";
import { useApolloClient } from "@apollo/client";
import { bnToBn, BN, BN_ZERO } from "@polkadot/util";
import type { Vec, Option } from "@polkadot/types";
import type { AccountId32 } from "@polkadot/types/interfaces";
import { useMarket } from "./market";
import type { PalletFeeMarketRelayer, OrderBook, RelayerEntity } from "../types";
import { getFeeMarketApiSection, isEthChain, isEthersApi, isPolkadotApi, isPolkadotChain } from "../utils";
import { RELAYER_OVERVIEW_DATA } from "../config";
import { isVec, isOption, getEthChainConfig } from "../utils";
import { useApi } from "./api";

interface RelayerOverview {
  id: string;
  relayer: string;
  orders: number;
  collateral: BN | BigNumber;
  quote: BN | BigNumber;
  reward: BN | BigNumber;
  slash: BN | BigNumber;
}

interface State {
  all: RelayerOverview[];
  assigned: RelayerOverview[];
  loading: boolean;
}

export const useRelayersOverview = () => {
  const { sourceChain, destinationChain } = useMarket();
  const { providerApi: api } = useApi();
  const apolloClient = useApolloClient();
  const [relayersOverview, setRelayersOverview] = useState<State>({ all: [], assigned: [], loading: false });

  useEffect(() => {
    let sub$$: Subscription | null = null;

    if (isEthChain(sourceChain) && isEthersApi(api)) {
      const chainConfig = getEthChainConfig(sourceChain);
      const contract = new Contract(chainConfig.contractAddress, chainConfig.contractInterface, api);

      const allObs = from(contract.relayerCount() as Promise<BigNumber>).pipe(
        switchMap((relayerCount) => from(contract.getOrderBook(relayerCount, true) as Promise<OrderBook>))
      );
      const assignedObs = chainConfig.isSmartChain
        ? from(contract.getTopRelayers() as Promise<string[]>)
        : forkJoin([contract.getTopRelayer() as Promise<string>]).pipe(catchError(() => of([])));

      setRelayersOverview((prev) => ({ ...prev, loading: true }));

      sub$$ = zip(allObs, assignedObs)
        .pipe(
          switchMap(([allRelayers, assignedRelayers]) =>
            zip(
              of(allRelayers),
              of(assignedRelayers),
              forkJoin(
                allRelayers[1].map((relayer) =>
                  apolloClient.query<
                    { relayer: Pick<RelayerEntity, "totalOrders" | "totalRewards" | "totalSlashes"> | null },
                    { relayerId: string }
                  >({
                    query: RELAYER_OVERVIEW_DATA,
                    variables: { relayerId: `${destinationChain}-${relayer.toString().toLowerCase()}` },
                  })
                )
              ),
              assignedRelayers.length
                ? forkJoin(
                    assignedRelayers.map((relayer) =>
                      apolloClient.query<
                        { relayer: Pick<RelayerEntity, "totalOrders" | "totalRewards" | "totalSlashes"> | null },
                        { relayerId: string }
                      >({
                        query: RELAYER_OVERVIEW_DATA,
                        variables: { relayerId: `${destinationChain}-${relayer.toString().toLowerCase()}` },
                      })
                    )
                  )
                : of([])
            )
          )
        )
        .subscribe({
          next: ([allRelayers, assignedRelayers, allRelayersData, assignedRelayersData]) => {
            setRelayersOverview({
              all: allRelayersData.map(({ data }, index) => {
                return {
                  id: allRelayers[1][index],
                  relayer: allRelayers[1][index],
                  orders: data.relayer?.totalOrders || 0,
                  collateral: allRelayers[3][index],
                  quote: allRelayers[2][index],
                  reward: bnToBn(data.relayer?.totalRewards),
                  slash: bnToBn(data.relayer?.totalSlashes),
                };
              }),
              assigned: assignedRelayersData.map(({ data }, index) => {
                const relayer = assignedRelayers[index];
                const idx = allRelayers[1].findIndex((item) => item.toLowerCase() === relayer.toLowerCase());
                return {
                  id: relayer,
                  relayer,
                  orders: data.relayer?.totalOrders || 0,
                  collateral: idx >= 0 ? allRelayers[3][idx] : BN_ZERO,
                  quote: idx >= 0 ? allRelayers[2][idx] : BN_ZERO,
                  reward: bnToBn(data.relayer?.totalRewards),
                  slash: bnToBn(data.relayer?.totalSlashes),
                };
              }),
              loading: false,
            });
          },
          error: (error) => {
            setRelayersOverview({ all: [], assigned: [], loading: false });
            console.error(error);
          },
        });
    } else if (isPolkadotChain(destinationChain) && isPolkadotApi(api)) {
      const apiSection = getFeeMarketApiSection(api, destinationChain);
      if (apiSection) {
        const allObs = from(api.query[apiSection].relayers<Vec<AccountId32> | Option<Vec<AccountId32>>>()).pipe(
          switchMap((res) => {
            if (isVec<AccountId32>(res)) {
              return of(res);
            } else if (isOption<Vec<AccountId32>>(res) && res.isSome) {
              return of(res.unwrap());
            }
            return of([]);
          }),
          switchMap((res) =>
            forkJoin(
              res.map((item) =>
                api.query[apiSection].relayersMap<PalletFeeMarketRelayer | Option<PalletFeeMarketRelayer>>(item)
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
        );
        const assigneObs = from(api.query[apiSection].assignedRelayers<Option<Vec<PalletFeeMarketRelayer>>>()).pipe(
          map((res) => (res.isSome ? res.unwrap().toArray() : []))
        );

        setRelayersOverview((prev) => ({ ...prev, loading: true }));
        sub$$ = zip(allObs, assigneObs)
          .pipe(
            switchMap(([allRelayers, assignedRelayers]) =>
              zip(
                of(allRelayers),
                of(assignedRelayers),
                forkJoin(
                  allRelayers.map((relayer) =>
                    apolloClient.query<
                      { relayer: Pick<RelayerEntity, "totalOrders" | "totalRewards" | "totalSlashes"> | null },
                      { relayerId: string }
                    >({
                      query: RELAYER_OVERVIEW_DATA,
                      variables: { relayerId: `${destinationChain}-${relayer.id.toString()}` },
                      notifyOnNetworkStatusChange: true,
                    })
                  )
                ),
                assignedRelayers.length
                  ? forkJoin(
                      assignedRelayers.map((relayer) =>
                        apolloClient.query<
                          { relayer: Pick<RelayerEntity, "totalOrders" | "totalRewards" | "totalSlashes"> | null },
                          { relayerId: string }
                        >({
                          query: RELAYER_OVERVIEW_DATA,
                          variables: { relayerId: `${destinationChain}-${relayer.id.toString()}` },
                          notifyOnNetworkStatusChange: true,
                        })
                      )
                    )
                  : of([])
              )
            )
          )
          .subscribe({
            next: ([allRelayers, assignedRelayers, allRelayersData, assignedRelayersData]) => {
              setRelayersOverview({
                all: allRelayersData.map(({ data }, index) => {
                  const relayer = allRelayers[index];
                  return {
                    id: relayer.id.toString(),
                    relayer: relayer.id.toString(),
                    orders: data.relayer?.totalOrders || 0,
                    collateral: relayer.collateral,
                    quote: relayer.fee,
                    reward: bnToBn(data.relayer?.totalRewards),
                    slash: bnToBn(data.relayer?.totalSlashes),
                  };
                }),
                assigned: assignedRelayersData.map(({ data }, index) => {
                  const relayer = assignedRelayers[index];
                  return {
                    id: relayer.id.toString(),
                    relayer: relayer.id.toString(),
                    orders: data.relayer?.totalOrders || 0,
                    collateral: relayer.collateral,
                    quote: relayer.fee,
                    reward: bnToBn(data.relayer?.totalRewards),
                    slash: bnToBn(data.relayer?.totalSlashes),
                  };
                }),
                loading: false,
              });
            },
            error: (error) => {
              setRelayersOverview({ all: [], assigned: [], loading: false });
              console.error(error);
            },
          });
      }
    }

    return () => {
      sub$$?.unsubscribe();
      setRelayersOverview({ all: [], assigned: [], loading: false });
    };
  }, [api, sourceChain, destinationChain, apolloClient]);

  return { relayersOverview };
};
