import { useState, useCallback, useEffect, useMemo } from "react";
import { EMPTY, from, switchMap, forkJoin } from "rxjs";

import { BN, BN_ZERO, bnToBn } from "@polkadot/util";
import type { ApiPromise } from "@polkadot/api";
import type { Vec, u128, Option } from "@polkadot/types";
import type { Balance, AccountId32 } from "@polkadot/types/interfaces";

import type { Market } from "@feemarket/app-provider";
import { useGrapgQuery } from "./graphQuery";
import { transformTotalOrdersOverview, transformFeeHistory, getFeeMarketApiSection } from "@feemarket/app-utils";
import { FEE_MARKET_OVERVIEW, TOTAL_ORDERS_OVERVIEW, FEE_HISTORY } from "@feemarket/app-config";
import type {
  MarketEntity,
  FeeMarketPolkadotChain,
  OrderEntity,
  FeeEntity,
  PalletFeeMarketRelayer,
} from "@feemarket/app-types";

interface Params {
  currentMarket: Market | null;
  apiPolkadot: ApiPromise | null;
  setRefresh: (fn: () => void) => void;
}

export const useFeeMarketOverviewData = ({ apiPolkadot, currentMarket, setRefresh }: Params) => {
  const [totalRelayers, setTotalRelayers] = useState<{
    total: number | null | undefined;
    active: number | null | undefined;
    loading: boolean;
  }>({ total: null, active: null, loading: true });
  const [currentFee, setCurrentFee] = useState<{ value: BN | Balance | null | undefined; loading: boolean }>({
    value: null,
    loading: true,
  }); // Amount

  const {
    data: speedTotalOrdersAndReward,
    refetch: updateSpeedTotalOrdersAndReward,
    loading: speedTotalOrdersAndRewardLoading,
  } = useGrapgQuery<
    { market: Pick<MarketEntity, "averageSpeed" | "totalOrders" | "totalReward"> | null },
    { destination: FeeMarketPolkadotChain | undefined }
  >(FEE_MARKET_OVERVIEW, {
    variables: {
      destination: currentMarket?.destination,
    },
  });

  const { averageSpeed, totalOrders, totalReward } = useMemo(() => {
    const averageSpeed: { value: number | null | undefined; loading: boolean } = {
      value: null,
      loading: speedTotalOrdersAndRewardLoading,
    }; // In milliseconds
    const totalOrders: { value: number | null | undefined; loading: boolean } = {
      value: null,
      loading: speedTotalOrdersAndRewardLoading,
    };
    const totalReward: { value: BN | null | undefined; loading: boolean } = {
      value: null,
      loading: speedTotalOrdersAndRewardLoading,
    }; // Amount

    if (speedTotalOrdersAndReward) {
      averageSpeed.value = speedTotalOrdersAndReward.market?.averageSpeed;
      totalOrders.value = speedTotalOrdersAndReward.market?.totalOrders;
      totalReward.value = speedTotalOrdersAndReward.market?.totalReward
        ? bnToBn(speedTotalOrdersAndReward.market.totalReward)
        : null;
    }

    return { averageSpeed, totalOrders, totalReward };
  }, [speedTotalOrdersAndReward, speedTotalOrdersAndRewardLoading]);

  const { transformedData: marketOrdersHistory, refetch: updateMarketOrdersHistory } = useGrapgQuery<
    { orders: { nodes: Pick<OrderEntity, "createBlockTime">[] } | null },
    { destination: FeeMarketPolkadotChain | undefined },
    [number, number][]
  >(
    TOTAL_ORDERS_OVERVIEW,
    {
      variables: {
        destination: currentMarket?.destination,
      },
    },
    transformTotalOrdersOverview
  );

  const { transformedData: marketFeeHistory, refetch: updateMarketFeeHistory } = useGrapgQuery<
    { feeHistory: Pick<FeeEntity, "data"> | null },
    { destination: FeeMarketPolkadotChain | undefined },
    [number, number][]
  >(
    FEE_HISTORY,
    {
      variables: {
        destination: currentMarket?.destination,
      },
    },
    transformFeeHistory
  );

  const updateTotalRelayers = useCallback(() => {
    if (apiPolkadot && currentMarket?.destination) {
      const apiSection = getFeeMarketApiSection(apiPolkadot, currentMarket.destination);

      if (apiSection) {
        setTotalRelayers((prev) => ({ ...prev, loading: true }));

        return from(apiPolkadot.query[apiSection].relayers<Vec<AccountId32>>())
          .pipe(
            switchMap((total) => {
              return total.length
                ? forkJoin(
                    total.map((relayer) => apiPolkadot.query[apiSection].relayersMap<PalletFeeMarketRelayer>(relayer))
                  )
                : EMPTY;
            })
          )
          .subscribe({
            next: (relayers) => {
              let active = 0;
              const collateralPerOrder = apiPolkadot.consts[apiSection].collateralPerOrder as u128;

              relayers.forEach((relayer) => {
                if (relayer.collateral.gte(collateralPerOrder)) {
                  active++;
                }
              });

              setTotalRelayers({
                active,
                total: relayers.length,
                loading: false,
              });
            },
            complete: () => setTotalRelayers({ total: 0, active: 0, loading: false }),
            error: () => setTotalRelayers((prev) => ({ ...prev, loading: false })),
          });
      }
    }

    return EMPTY.subscribe();
  }, [apiPolkadot, currentMarket]);

  const updateCurrentFee = useCallback(() => {
    if (apiPolkadot && currentMarket?.destination) {
      const apiSection = getFeeMarketApiSection(apiPolkadot, currentMarket.destination);

      if (apiSection) {
        setCurrentFee((prev) => ({ ...prev, loading: true }));

        return from(apiPolkadot.query[apiSection].assignedRelayers<Option<Vec<PalletFeeMarketRelayer>>>()).subscribe({
          next: (res) => {
            if (res.isSome) {
              const lastOne = res.unwrap().pop();
              setCurrentFee({ loading: false, value: lastOne?.fee });
            } else {
              setCurrentFee({ loading: false, value: BN_ZERO });
            }
          },
          complete: () => setCurrentFee({ value: BN_ZERO, loading: false }),
          error: () => setCurrentFee((prev) => ({ ...prev, loading: false })),
        });
      }
    }

    return EMPTY.subscribe();
  }, [apiPolkadot, currentMarket?.destination]);

  useEffect(() => {
    const sub$$ = updateTotalRelayers();
    return () => sub$$.unsubscribe();
  }, [updateTotalRelayers]);

  useEffect(() => {
    const sub$$ = updateCurrentFee();
    return () => sub$$.unsubscribe();
  }, [updateCurrentFee]);

  useEffect(() => {
    setRefresh(() => () => {
      updateSpeedTotalOrdersAndReward();
      updateTotalRelayers();
      updateCurrentFee();
      updateMarketOrdersHistory();
      updateMarketFeeHistory();
    });
  }, [
    setRefresh,
    updateSpeedTotalOrdersAndReward,
    updateTotalRelayers,
    updateCurrentFee,
    updateMarketOrdersHistory,
    updateMarketFeeHistory,
  ]);

  return { averageSpeed, totalOrders, totalReward, totalRelayers, currentFee, marketOrdersHistory, marketFeeHistory };
};
