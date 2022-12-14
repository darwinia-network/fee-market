import { providers, Contract, BigNumber } from "ethers";
import { useCallback, useEffect, useState } from "react";
import { EMPTY, from, switchMap, forkJoin, map, zip, of, Observable } from "rxjs";
import { useApolloClient } from "@apollo/client";
import { bnToBn, BN, BN_ZERO } from "@polkadot/util";
import type { Vec, Option } from "@polkadot/types";
import type { AccountId32 } from "@polkadot/types/interfaces";
import { useMarket } from "@feemarket/market";
import type { PalletFeeMarketRelayer, OrderBook } from "@feemarket/types";
import type { RelayerEntity } from "@feemarket/config";
import { getFeeMarketApiSection, isEthApi, isEthChain, isPolkadotApi, isPolkadotChain } from "@feemarket/utils";
import { RELAYER_OVERVIEW_DATA } from "@feemarket/config";
import { isVec, isOption, getEthChainConfig } from "@feemarket/utils";
import { useApi } from "@feemarket/api";

interface DataSource {
  id: string;
  relayer: string;
  count: number;
  collateral: BN | BigNumber;
  quote: BN | BigNumber;
  reward: BN | BigNumber;
  slash: BN | BigNumber;
}

export const useRelayersOverviewData = () => {
  const { currentMarket, setRefresh } = useMarket();
  const { providerApi: api } = useApi();
  const apolloClient = useApolloClient();
  const [relayersOverviewData, setRelayersOverviewData] = useState<{
    allRelayersDataSource: DataSource[];
    assignedRelayersDataSource: DataSource[];
    loading: boolean;
  }>({
    allRelayersDataSource: [],
    assignedRelayersDataSource: [],
    loading: false,
  });

  const sourceChain = currentMarket?.source;
  const destinationChain = currentMarket?.destination;

  const getRelayersOverviewData = useCallback(() => {
    if (isEthApi(api) && isEthChain(sourceChain)) {
      const chainConfig = getEthChainConfig(sourceChain);
      const contract = new Contract(chainConfig.contractAddress, chainConfig.contractInterface, api);

      const allRelayersObs = from(contract.relayerCount() as Promise<BigNumber>).pipe(
        switchMap((relayerCount) => from(contract.getOrderBook(relayerCount, true) as Promise<OrderBook>))
      );
      const assignedRelayersObs = chainConfig.isSmartChain
        ? from(contract.getTopRelayers() as Promise<string[]>)
        : forkJoin([contract.getTopRelayer() as Promise<string>]);

      setRelayersOverviewData((prev) => ({ ...prev, loading: true }));

      return zip(allRelayersObs, assignedRelayersObs)
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
              forkJoin(
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
            )
          )
        )
        .subscribe({
          next: ([allRelayers, assignedRelayers, allRelayersData, assignedRelayersData]) => {
            setRelayersOverviewData({
              allRelayersDataSource: allRelayersData.map(({ data }, index) => {
                const relayer = allRelayers[1][index];
                const collateral = allRelayers[3][index];
                const quote = allRelayers[2][index];
                return {
                  id: `${index}`,
                  relayer,
                  count: data.relayer?.totalOrders || 0,
                  collateral,
                  quote,
                  reward: bnToBn(data.relayer?.totalRewards),
                  slash: bnToBn(data.relayer?.totalSlashes),
                };
              }),
              assignedRelayersDataSource: assignedRelayersData.map(({ data }, index) => {
                const relayer = assignedRelayers[index];
                const idx = allRelayers[1].findIndex((item) => item.toLowerCase() === relayer.toLowerCase());
                const collateral = idx >= 0 ? allRelayers[3][idx] : BN_ZERO;
                const quote = idx >= 0 ? allRelayers[2][idx] : BN_ZERO;

                return {
                  id: `${index}`,
                  relayer,
                  count: data.relayer?.totalOrders || 0,
                  collateral,
                  quote,
                  reward: bnToBn(data.relayer?.totalRewards),
                  slash: bnToBn(data.relayer?.totalSlashes),
                };
              }),
              loading: false,
            });
          },
          error: (error) => {
            console.error("get relayer overview data:", error);
            setRelayersOverviewData({ allRelayersDataSource: [], assignedRelayersDataSource: [], loading: false });
          },
          complete: () => {
            setRelayersOverviewData((prev) => ({ ...prev, loading: false }));
          },
        });
    } else if (isPolkadotApi(api) && isPolkadotChain(destinationChain)) {
      const apiSection = getFeeMarketApiSection(api, destinationChain);

      if (apiSection) {
        const allRelayersObs = from(api.query[apiSection].relayers<Vec<AccountId32> | Option<Vec<AccountId32>>>()).pipe(
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
        const assignedRelayersObs = from(
          api.query[apiSection].assignedRelayers<Option<Vec<PalletFeeMarketRelayer>>>()
        ).pipe(map((res) => (res.isSome ? res.unwrap().toArray() : [])));

        setRelayersOverviewData((prev) => ({ ...prev, loading: true }));

        return zip(allRelayersObs, assignedRelayersObs)
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
                        })
                      )
                    )
                  : of([])
              )
            )
          )
          .subscribe({
            next: ([allRelayers, assignedRelayers, allRelayersData, assignedRelayersData]) => {
              setRelayersOverviewData({
                allRelayersDataSource: allRelayersData.map(({ data }, index) => {
                  const relayer = allRelayers[index];
                  return {
                    id: `${index}`,
                    relayer: relayer.id.toString(),
                    count: data.relayer?.totalOrders || 0,
                    collateral: relayer.collateral,
                    quote: relayer.fee,
                    reward: bnToBn(data.relayer?.totalRewards),
                    slash: bnToBn(data.relayer?.totalSlashes),
                  };
                }),
                assignedRelayersDataSource: assignedRelayersData.map(({ data }, index) => {
                  const relayer = assignedRelayers[index];
                  return {
                    id: `${index}`,
                    relayer: relayer.id.toString(),
                    count: data.relayer?.totalOrders || 0,
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
              console.error("get relayer overview data:", error);
              setRelayersOverviewData({ allRelayersDataSource: [], assignedRelayersDataSource: [], loading: false });
            },
            complete: () => {
              setRelayersOverviewData((prev) => ({ ...prev, loading: false }));
            },
          });
      }
    }

    setRelayersOverviewData({ allRelayersDataSource: [], assignedRelayersDataSource: [], loading: false });
    return EMPTY.subscribe();
  }, [api, sourceChain, destinationChain]);

  useEffect(() => {
    const sub$$ = getRelayersOverviewData();
    return () => {
      sub$$.unsubscribe();
      setRelayersOverviewData({ allRelayersDataSource: [], assignedRelayersDataSource: [], loading: false });
    };
  }, [getRelayersOverviewData]);

  useEffect(() => {
    setRefresh(() => () => {
      getRelayersOverviewData();
    });
  }, [setRefresh, getRelayersOverviewData]);

  return { relayersOverviewData };
};
