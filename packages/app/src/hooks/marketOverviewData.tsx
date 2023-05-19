import { useState, useCallback, useEffect, useMemo } from "react";
import { EMPTY, from, switchMap, forkJoin, of, Observable, zip } from "rxjs";
import { BigNumber, Contract } from "ethers";
import { BN, BN_ZERO, bnToBn } from "@polkadot/util";
import type { Vec, u128, Option } from "@polkadot/types";
import type { AccountId32 } from "@polkadot/types/interfaces";
import { useMarket } from "./market";
import { useApi } from "./api";
import {
  transformOrdersCountData,
  transformFeeHistoryData,
  getFeeMarketApiSection,
  isVec,
  isOption,
  isPolkadotApi,
  isEthChain,
  isPolkadotChain,
  getEthChainConfig,
  isEthApi,
} from "../utils";
import {
  MARKET_SUMMARY,
  ORDERS_COUNT_ETH_DATA,
  ORDERS_COUNT_POLKADOT_DATA,
  FEE_HISTORY_ETH_DATA,
  FEE_HISTORY_POLKADOT_DATA,
} from "../config";
import type { MarketEntity, OrderEntity, FeeEntity } from "../config";
import type { PalletFeeMarketRelayer, OrderBook, FeeMarketChain } from "../types";
import { useGrapgQuery } from "./graphQuery";
import { useApolloClient } from "@apollo/client";

export const useMarketOverviewData = () => {
  const { currentMarket } = useMarket();
  const { providerApi: api } = useApi();
  const apolloClient = useApolloClient();

  const sourceChain = currentMarket?.source;
  const destinationChain = currentMarket?.destination;

  // total relayers, active relayers
  const [totalRelayers, setTotalRelayers] = useState<{
    total: number | null | undefined;
    active: number | null | undefined;
    loading: boolean;
  }>({ total: null, active: null, loading: false });

  // current fee
  const [currentFee, setCurrentFee] = useState<{ value: BN | BigNumber | null | undefined; loading: boolean }>({
    value: null,
    loading: false,
  });

  // const [ordersCountPolkadotDataLoading, setOrdersCountPolkadotDataLoading] = useState(false);

  // speed, total orders, total reward
  /*It'll reload automatically when this component is re-rendered, so far
  the updateSpeedTotalOrdersAndReward method is useless */
  const {
    data: speedTotalOrdersAndReward,
    // refetch: updateSpeedTotalOrdersAndReward,
    loading: speedTotalOrdersAndRewardLoading,
  } = useGrapgQuery<
    { market: Pick<MarketEntity, "averageSpeed" | "totalOrders" | "totalReward"> | null },
    { destination: FeeMarketChain | undefined }
  >(MARKET_SUMMARY, {
    variables: {
      destination: destinationChain,
    },
  });

  const { averageSpeed, totalOrders, totalReward } = useMemo(() => {
    const averageSpeed: { value: number | string | null | undefined; loading: boolean } = {
      value: null, // in milliseconds
      loading: speedTotalOrdersAndRewardLoading,
    };

    const totalOrders: { value: number | null | undefined; loading: boolean } = {
      value: null,
      loading: speedTotalOrdersAndRewardLoading,
    };

    const totalReward: { value: BN | null | undefined; loading: boolean } = {
      value: null,
      loading: speedTotalOrdersAndRewardLoading,
    };

    if (speedTotalOrdersAndReward) {
      averageSpeed.value = speedTotalOrdersAndReward.market?.averageSpeed;
      totalOrders.value = speedTotalOrdersAndReward.market?.totalOrders;
      totalReward.value = speedTotalOrdersAndReward.market?.totalReward
        ? bnToBn(speedTotalOrdersAndReward.market.totalReward)
        : null;
    }

    if (averageSpeed.value && isEthChain(sourceChain)) {
      // convert to millionsecond
      averageSpeed.value = Number(averageSpeed.value) * 1000;
    }

    return { averageSpeed, totalOrders, totalReward };
  }, [sourceChain, speedTotalOrdersAndReward, speedTotalOrdersAndRewardLoading]);

  // ============================= Begin: Overview page「Orders Count」Chart ===================================

  const [ethOrdersCount, setEthOrdersCount] = useState<{ data: [number, number][]; loading: boolean }>({
    data: [],
    loading: false,
  });
  const [polkadotOrdersCount, setPolkadotOrdersCount] = useState<{ data: [number, number][]; loading: boolean }>({
    data: [],
    loading: false,
  });

  useEffect(() => {
    if (!isEthChain(sourceChain)) {
      return;
    }

    setEthOrdersCount((prev) => ({ ...prev, loading: true }));
    const sub$$ = from(
      apolloClient.query<{ orders: Pick<OrderEntity, "createBlockTime">[] | null }>({ query: ORDERS_COUNT_ETH_DATA })
    ).subscribe({
      next: ({ data, loading }) => {
        setEthOrdersCount({ data: transformOrdersCountData(data), loading });
      },
      error: (error) => {
        setEthOrdersCount({ data: [], loading: false });
        console.error(error);
      },
    });
    return () => {
      sub$$.unsubscribe();
      setEthOrdersCount({ data: [], loading: false });
    };
  }, [apolloClient, sourceChain]);

  useEffect(() => {
    if (!isPolkadotChain(sourceChain)) {
      return;
    }

    setPolkadotOrdersCount((prev) => ({ ...prev, loading: true }));
    const sub$$ = from(
      apolloClient.query<
        { orders: { nodes: Pick<OrderEntity, "createBlockTime">[] } | null },
        { destination: FeeMarketChain | undefined }
      >({
        query: ORDERS_COUNT_POLKADOT_DATA,
        variables: {
          destination: destinationChain,
        },
      })
    ).subscribe({
      next: ({ data, loading }) => {
        setPolkadotOrdersCount({ data: transformOrdersCountData(data), loading });
      },
      error: (error) => {
        setPolkadotOrdersCount({ data: [], loading: false });
        console.error(error);
      },
    });
    return () => {
      sub$$.unsubscribe();
      setPolkadotOrdersCount({ data: [], loading: false });
    };
  }, [apolloClient, destinationChain, sourceChain]);

  const ordersCount = useMemo(() => {
    if (isEthChain(sourceChain)) {
      return ethOrdersCount;
    } else if (isPolkadotChain(sourceChain)) {
      return polkadotOrdersCount;
    }
    return { data: [], loading: false };
  }, [sourceChain, ethOrdersCount, polkadotOrdersCount]);

  // ============================= End: Overview page「Orders Count」Chart ===================================

  // ============================= Begin: Overview page「Fee History」Chart ===================================

  // const {
  //   transformedData: feeHistoryEthData,
  //   loading: feeHistoryEthDataLoading,
  //   refetch: updateFeeHistoryEthData,
  // } = useGrapgQuery<{ feeHistories: { amount: string; blockTime: string }[] }, { skip: number }, [number, BN][]>(
  //   FEE_HISTORY_ETH_DATA,
  //   {},
  //   transformFeeHistoryData
  // );

  const [ethFeeHistory, setEthFeeHistory] = useState<{ data: [number, BN][]; loading: boolean }>({
    data: [],
    loading: false,
  });
  const [polkadotFeeHistory, setPolkadotFeeHistory] = useState<{ data: [number, BN][]; loading: boolean }>({
    data: [],
    loading: false,
  });

  const getPartOfFeeHistories = useCallback(
    async (skip: number) => {
      return await apolloClient.query<{ feeHistories: { amount: string; blockTime: string }[] }, { skip: number }>({
        query: FEE_HISTORY_ETH_DATA,
        variables: { skip },
      });
    },
    [apolloClient]
  );

  useEffect(() => {
    (async (sourceChain?: FeeMarketChain) => {
      if (isEthChain(sourceChain)) {
        setEthFeeHistory((prev) => ({ ...prev, loading: true }));

        let skip = 0;
        let data: { amount: string; blockTime: string }[] = [];
        let tmp = await getPartOfFeeHistories(skip);

        while (!tmp.error && tmp.data.feeHistories.length) {
          skip += tmp.data.feeHistories.length;
          data = data.concat(tmp.data.feeHistories);
          tmp = await getPartOfFeeHistories(skip);
        }

        setEthFeeHistory({ data: transformFeeHistoryData({ feeHistories: data }), loading: false });
      }
    })(sourceChain);

    return () => {
      setEthFeeHistory({ data: [], loading: false });
    };
  }, [sourceChain, getPartOfFeeHistories]);

  useEffect(() => {
    if (!isPolkadotChain(sourceChain)) {
      return;
    }
    setPolkadotFeeHistory((prev) => ({ ...prev, loading: true }));

    const sub$$ = from(
      apolloClient.query<{ feeHistory: Pick<FeeEntity, "data"> | null }, { destination: FeeMarketChain | undefined }>({
        query: FEE_HISTORY_POLKADOT_DATA,
        variables: {
          destination: destinationChain,
        },
      })
    ).subscribe({
      next: ({ data, loading }) => {
        setPolkadotFeeHistory({ loading, data: transformFeeHistoryData(data) });
      },
      error: (error) => {
        setPolkadotFeeHistory({ data: [], loading: false });
        console.error(error);
      },
    });

    return () => {
      sub$$.unsubscribe();
      setPolkadotFeeHistory({ data: [], loading: false });
    };
  }, [sourceChain, destinationChain, apolloClient]);

  const feeHistory = useMemo(() => {
    if (isEthChain(sourceChain)) {
      return ethFeeHistory;
    } else if (isPolkadotChain(sourceChain)) {
      return polkadotFeeHistory;
    }
    return { data: [], loading: false };
  }, [sourceChain, ethFeeHistory, polkadotFeeHistory]);

  // ============================= Begin: Overview page「Fee History」Chart ===================================

  /*This method will be called automatically whenever the the sourceChain or destinationChain is changed*/
  const updateTotalRelayers = useCallback(() => {
    if (isEthApi(api) && isEthChain(sourceChain)) {
      const chainConfig = getEthChainConfig(sourceChain);
      const contract = new Contract(chainConfig.contractAddress, chainConfig.contractInterface, api);

      setTotalRelayers((prev) => ({ ...prev, loading: true }));

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

    return EMPTY.subscribe();
  }, [api, sourceChain, destinationChain]);

  const updateCurrentFee = useCallback(() => {
    if (isEthApi(api) && isEthChain(sourceChain)) {
      const chainConfig = getEthChainConfig(sourceChain);
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

    return EMPTY.subscribe();
  }, [api, sourceChain, destinationChain]);

  useEffect(() => {
    const sub$$ = updateTotalRelayers();
    return () => {
      sub$$.unsubscribe();
      setTotalRelayers({ active: null, total: null, loading: false });
    };
  }, [updateTotalRelayers]);

  useEffect(() => {
    const sub$$ = updateCurrentFee();
    return () => {
      sub$$.unsubscribe();
      setCurrentFee({ value: null, loading: false });
    };
  }, [updateCurrentFee]);

  return {
    averageSpeed,
    totalOrders,
    totalReward,
    totalRelayers,
    currentFee,
    ordersCount,
    feeHistory,
  };
};
