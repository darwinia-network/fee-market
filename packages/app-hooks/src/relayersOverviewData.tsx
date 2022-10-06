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
  activeTabId: string;
  currentMarket: Market | null;
  apiPolkadot: ApiPromise | null;
  setRefresh: (fn: () => void) => void;
}

export const useRelayersOverviewData = ({ activeTabId, currentMarket, apiPolkadot, setRefresh }: Params) => {
  const apolloClient = useApolloClient();
  const [relayersOverviewData, setRelayersOverviewData] = useState<{ dataSource: DataSource[]; loading: boolean }>({
    dataSource: [],
    loading: true,
  });

  const getRelayersOverviewData = useCallback(() => {
    if (apiPolkadot && currentMarket?.destination) {
      const apiSection = getFeeMarketApiSection(apiPolkadot, currentMarket.destination);

      if (apiSection) {
        const relayersObs =
          activeTabId === "1"
            ? from(apiPolkadot.query[apiSection].relayers<Vec<AccountId32>>()).pipe(
                switchMap((res) =>
                  forkJoin(res.map((item) => apiPolkadot.query[apiSection].relayersMap<PalletFeeMarketRelayer>(item)))
                )
              )
            : from(apiPolkadot.query[apiSection].assignedRelayers<Option<Vec<PalletFeeMarketRelayer>>>()).pipe(
                map((res) => (res.isSome ? res.unwrap().toArray() : []))
              );

        setRelayersOverviewData((prev) => ({ ...prev, loading: true }));

        return relayersObs
          .pipe(
            switchMap((relayers) =>
              zip(
                of(relayers),
                forkJoin(
                  relayers.map((relayer) =>
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
          .subscribe(([relayers, res]) => {
            setRelayersOverviewData({
              dataSource: res.map(({ data }, index) => {
                const relayer = relayers[index];
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

    setRelayersOverviewData({ dataSource: [], loading: false });
    return EMPTY.subscribe();
  }, [apiPolkadot, currentMarket?.destination, activeTabId]);

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
