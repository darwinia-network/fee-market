import { BN } from "@polkadot/util";
import { useCallback, useEffect, useState } from "react";
import { useApolloClient } from "@apollo/client";
import { Subscription, from } from "rxjs";
import { FEE_HISTORY_ETH_DATA, FEE_HISTORY_POLKADOT_DATA } from "../config";
import { useMarket } from "./market";
import { isEthChain, isPolkadotChain, transformFeeHistoryData } from "../utils";
import type { FeeMarketChain, FeeEntity } from "../types";

interface State {
  data: [number, BN][];
  loading: boolean;
}

export const useFeeHistory = () => {
  const apolloClient = useApolloClient();
  const { sourceChain, destinationChain } = useMarket();
  const [feeHistory, setFeeHistory] = useState<State>({ data: [], loading: false });

  const getPartialEthFeeHistory = useCallback(
    async (skip: number) => {
      return await apolloClient.query<{ feeHistories: { amount: string; blockTime: string }[] }, { skip: number }>({
        query: FEE_HISTORY_ETH_DATA,
        variables: { skip },
      });
    },
    [apolloClient]
  );

  const getEthFeeHistory = useCallback(async () => {
    let skip = 0;
    let data: { amount: string; blockTime: string }[] = [];
    let partial = await getPartialEthFeeHistory(skip);

    while (!partial.error && partial.data.feeHistories.length) {
      skip += partial.data.feeHistories.length;
      data = data.concat(partial.data.feeHistories);
      partial = await getPartialEthFeeHistory(skip);
    }
    return data;
  }, [getPartialEthFeeHistory]);

  useEffect(() => {
    let sub$$: Subscription | null = null;

    if (isEthChain(sourceChain)) {
      setFeeHistory((prev) => ({ ...prev, loading: true }));

      sub$$ = from(getEthFeeHistory()).subscribe({
        next: (value) => {
          setFeeHistory({ data: transformFeeHistoryData({ feeHistories: value }), loading: false });
        },
        error: (error) => {
          setFeeHistory({ data: [], loading: false });
          console.error(error);
        },
      });
    } else if (isPolkadotChain(sourceChain)) {
      setFeeHistory((prev) => ({ ...prev, loading: true }));

      sub$$ = from(
        apolloClient.query<{ feeHistory: Pick<FeeEntity, "data"> | null }, { destination: FeeMarketChain | undefined }>(
          {
            query: FEE_HISTORY_POLKADOT_DATA,
            variables: {
              destination: destinationChain,
            },
            notifyOnNetworkStatusChange: true,
          }
        )
      ).subscribe({
        next: ({ data, loading }) => {
          setFeeHistory({ loading, data: transformFeeHistoryData(data) });
        },
        error: (error) => {
          setFeeHistory({ data: [], loading: false });
          console.error(error);
        },
      });
    }

    return () => {
      sub$$?.unsubscribe();
      setFeeHistory({ data: [], loading: false });
    };
  }, [sourceChain, destinationChain, apolloClient, getEthFeeHistory]);

  return { feeHistory };
};
