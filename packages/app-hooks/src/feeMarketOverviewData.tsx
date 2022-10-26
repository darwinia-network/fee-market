import { useState, useCallback, useEffect, useMemo } from "react";
import { EMPTY, from, switchMap, forkJoin, of, Observable, zip } from "rxjs";
import { providers, Contract, BigNumber } from "ethers";
import { BN, BN_ZERO, bnToBn } from "@polkadot/util";
import type { ApiPromise } from "@polkadot/api";
import type { Vec, u128, Option } from "@polkadot/types";
import type { AccountId32 } from "@polkadot/types/interfaces";

import type { Market } from "@feemarket/app-provider";
import { useGrapgQuery } from "./graphQuery";
import {
  transformTotalOrdersOverview,
  transformFeeHistory,
  getFeeMarketApiSection,
  isVec,
  isOption,
  isEthApi,
  isPolkadotApi,
  isEthChain,
  isPolkadotChain,
} from "@feemarket/app-utils";
import {
  FEE_MARKET_OVERVIEW,
  TOTAL_ORDERS_OVERVIEW_ETH,
  TOTAL_ORDERS_OVERVIEW_POLKADOT,
  FEE_HISTORY_ETH,
  FEE_HISTORY_POLKADOT,
  ETH_CHAIN_CONF,
} from "@feemarket/app-config";
import type {
  MarketEntity,
  OrderEntity,
  FeeEntity,
  PalletFeeMarketRelayer,
  FeeMarketChain,
} from "@feemarket/app-types";

interface Params {
  currentMarket: Market | null;
  api: ApiPromise | providers.Provider | null;
  setRefresh: (fn: () => void) => void;
}

export const useFeeMarketOverviewData = ({ api, currentMarket, setRefresh }: Params) => {
  const sourceChain = currentMarket?.source;
  const destinationChain = currentMarket?.destination;

  const [totalRelayers, setTotalRelayers] = useState<{
    total: number | null | undefined;
    active: number | null | undefined;
    loading: boolean;
  }>({ total: null, active: null, loading: false });
  const [currentFee, setCurrentFee] = useState<{ value: BN | BigNumber | null | undefined; loading: boolean }>({
    value: null,
    loading: false,
  }); // Amount

  const {
    data: speedTotalOrdersAndReward,
    refetch: updateSpeedTotalOrdersAndReward,
    loading: speedTotalOrdersAndRewardLoading,
  } = useGrapgQuery<
    { market: Pick<MarketEntity, "averageSpeed" | "totalOrders" | "totalReward"> | null },
    { destination: FeeMarketChain | undefined }
  >(FEE_MARKET_OVERVIEW, {
    variables: {
      destination: currentMarket?.destination,
    },
  });

  const { averageSpeed, totalOrders, totalReward } = useMemo(() => {
    const averageSpeed: { value: number | string | null | undefined; loading: boolean } = {
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

  // ============================= Begin: Overview page「Orders Count」Chart ===================================
  const { transformedData: marketOrdersHistoryEth, refetch: updateMarketOrdersHistoryEth } = useGrapgQuery<
    { orders: Pick<OrderEntity, "createBlockTime">[] | null },
    unknown,
    [number, number][]
  >(TOTAL_ORDERS_OVERVIEW_ETH, {}, transformTotalOrdersOverview);

  const { transformedData: marketOrdersHistoryPolkadot, refetch: updateMarketOrdersHistoryPolkadot } = useGrapgQuery<
    { orders: { nodes: Pick<OrderEntity, "createBlockTime">[] } | null },
    { destination: FeeMarketChain | undefined },
    [number, number][]
  >(
    TOTAL_ORDERS_OVERVIEW_POLKADOT,
    {
      variables: {
        destination: currentMarket?.destination,
      },
    },
    transformTotalOrdersOverview
  );

  const marketOrdersHistory = useMemo(() => {
    if (marketOrdersHistoryEth?.length) {
      return marketOrdersHistoryEth;
    }
    if (marketOrdersHistoryPolkadot?.length) {
      return marketOrdersHistoryPolkadot;
    }
    return [];
  }, [marketOrdersHistoryEth, marketOrdersHistoryPolkadot]);

  const updateMarketOrdersHistory = useCallback(() => {
    updateMarketOrdersHistoryEth();
    updateMarketOrdersHistoryPolkadot();
  }, [updateMarketOrdersHistoryEth, updateMarketOrdersHistoryPolkadot]);

  // ============================= End: Overview page「Orders Count」Chart ===================================

  // ============================= Begin: Overview page「Fee History」Chart ===================================

  const { transformedData: marketFeeHistoryEth, refetch: updateMarketFeeHistoryEth } = useGrapgQuery<
    { feeHistories: { amount: string; blockTime: string }[] },
    unknown,
    [number, BN][]
  >(FEE_HISTORY_ETH, {}, transformFeeHistory);

  const { transformedData: marketFeeHistoryPolkadot, refetch: updateMarketFeeHistoryPolkadot } = useGrapgQuery<
    { feeHistory: Pick<FeeEntity, "data"> | null },
    { destination: FeeMarketChain | undefined },
    [number, BN][]
  >(
    FEE_HISTORY_POLKADOT,
    {
      variables: {
        destination: currentMarket?.destination,
      },
    },
    transformFeeHistory
  );

  const marketFeeHistory = useMemo(() => {
    if (marketFeeHistoryEth?.length) {
      return marketFeeHistoryEth;
    }
    if (marketFeeHistoryPolkadot?.length) {
      return marketFeeHistoryPolkadot;
    }
    return [];
  }, [marketFeeHistoryEth, marketFeeHistoryPolkadot]);

  const updateMarketFeeHistory = useCallback(() => {
    updateMarketFeeHistoryEth();
    updateMarketFeeHistoryPolkadot();
  }, [updateMarketFeeHistoryEth, updateMarketFeeHistoryPolkadot]);

  // ============================= Begin: Overview page「Fee History」Chart ===================================

  const updateTotalRelayers = useCallback(() => {
    if (isEthApi(api) && isEthChain(sourceChain)) {
      const chainConfig = ETH_CHAIN_CONF[sourceChain];
      const contract = new Contract(chainConfig.contractAddress, chainConfig.contractInterface, api);

      setTotalRelayers((prev) => ({ ...prev, loading: true }));

      // index, relayers, fees, collaterals, locks
      type OrderBook = [BigNumber, string[], BigNumber[], BigNumber[], BigNumber[]];

      return from(contract.relayerCount() as Promise<BigNumber>)
        .pipe(
          switchMap((relayerCount) =>
            zip(of(relayerCount), from(contract.getOrderBook(relayerCount, false) as Promise<OrderBook>))
          )
        )
        .subscribe({
          next: ([relayerCount, orderBook]) => {
            setTotalRelayers({
              active: orderBook[1].length,
              total: relayerCount.toNumber(),
              loading: false,
            });
          },
          complete: () => setTotalRelayers((prev) => ({ ...prev, loading: false })),
          error: () => setTotalRelayers({ active: null, total: null, loading: false }),
        });
    } else if (isPolkadotApi(api) && isPolkadotChain(destinationChain)) {
      const apiSection = getFeeMarketApiSection(api, destinationChain);

      if (apiSection) {
        setTotalRelayers((prev) => ({ ...prev, loading: true }));

        return from(api.query[apiSection].relayers<Vec<AccountId32> | Option<Vec<AccountId32>>>())
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

              setTotalRelayers({
                active,
                total: relayers.length,
                loading: false,
              });
            },
            complete: () => setTotalRelayers((prev) => ({ ...prev, loading: false })),
            error: () => setTotalRelayers({ active: null, total: null, loading: false }),
          });
      }
    }

    setTotalRelayers({ active: null, total: null, loading: false });

    return EMPTY.subscribe();
  }, [api, sourceChain, destinationChain]);

  const updateCurrentFee = useCallback(() => {
    if (isEthApi(api) && isEthChain(sourceChain)) {
      const chainConfig = ETH_CHAIN_CONF[sourceChain];
      const contract = new Contract(chainConfig.contractAddress, chainConfig.contractInterface, api);

      setCurrentFee((prev) => ({ ...prev, loading: true }));

      return from(contract.market_fee() as Promise<BigNumber>).subscribe({
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

        return from(api.query[apiSection].assignedRelayers<Option<Vec<PalletFeeMarketRelayer>>>()).subscribe({
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

    setCurrentFee({ value: null, loading: false });

    return EMPTY.subscribe();
  }, [api, sourceChain, destinationChain]);

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
