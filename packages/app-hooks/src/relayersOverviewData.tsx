import type { ApiPromise } from "@polkadot/api";
import type { Vec, Option } from "@polkadot/types";
import type { AccountId32, Balance } from "@polkadot/types/interfaces";
import type { Market } from "@feemarket/app-provider";
import type { PalletFeeMarketRelayer, RelayerEntity } from "@feemarket/app-types";
import { getFeeMarketApiSection } from "@feemarket/app-utils";
import { useCallback, useEffect, useState } from "react";
import { EMPTY, from, switchMap, forkJoin, map, zip, of } from "rxjs";
import { useApolloClient } from "@apollo/client";
import { RELAYER_OVERVIEW } from "@feemarket/app-config";
import { bnToBn, BN } from "@polkadot/util";

interface DataSource {
  id: string;
  relayer: string;
  count: number;
  collateral: Balance;
  quote: Balance;
  reward: BN;
  slash: BN;
}

interface Params {
  currentMarket: Market | null;
  apiPolkadot: ApiPromise | null;
  setRefresh: (fn: () => void) => void;
}

export const useRelayersOverviewData = ({ currentMarket, apiPolkadot, setRefresh }: Params) => {
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

  const getRelayersOverviewData = useCallback(() => {
    if (apiPolkadot && currentMarket?.destination) {
      const apiSection = getFeeMarketApiSection(apiPolkadot, currentMarket.destination);

      if (apiSection) {
        const allRelayersObs = from(apiPolkadot.query[apiSection].relayers<Vec<AccountId32>>()).pipe(
          switchMap((res) =>
            forkJoin(res.map((item) => apiPolkadot.query[apiSection].relayersMap<PalletFeeMarketRelayer>(item)))
          )
        );
        const assignedRelayersObs = from(
          apiPolkadot.query[apiSection].assignedRelayers<Option<Vec<PalletFeeMarketRelayer>>>()
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
                      query: RELAYER_OVERVIEW,
                      variables: { relayerId: `${currentMarket.destination}-${relayer.id.toString()}` },
                    })
                  )
                ),
                forkJoin(
                  assignedRelayers.map((relayer) =>
                    apolloClient.query<
                      { relayer: Pick<RelayerEntity, "totalOrders" | "totalRewards" | "totalSlashes"> | null },
                      { relayerId: string }
                    >({
                      query: RELAYER_OVERVIEW,
                      variables: { relayerId: `${currentMarket.destination}-${relayer.id.toString()}` },
                    })
                  )
                )
              )
            )
          )
          .subscribe(([allRelayers, assignedRelayers, allRelayersData, assignedRelayersData]) => {
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
          });
      }
    }

    setRelayersOverviewData({ allRelayersDataSource: [], assignedRelayersDataSource: [], loading: false });
    return EMPTY.subscribe();
  }, [apiPolkadot, currentMarket?.destination]);

  useEffect(() => {
    const sub$$ = getRelayersOverviewData();
    return () => sub$$.unsubscribe();
  }, [getRelayersOverviewData]);

  useEffect(() => {
    setRefresh(() => () => {
      getRelayersOverviewData();
    });
  }, [setRefresh, getRelayersOverviewData]);

  return { relayersOverviewData };
};
