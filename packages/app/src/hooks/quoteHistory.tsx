import type { BN } from "@polkadot/util";
import { useEffect, useState } from "react";
import { Subscription, from } from "rxjs";
import { useApolloClient } from "@apollo/client";
import { QUOTE_HISTORY_ETH_DATA, QUOTE_HISTORY_POLKADOT_DATA } from "../config";
import { isEthChain, isPolkadotChain, transformQuoteHistoryEthData, transformQuoteHistoryPolkadotData } from "../utils";
import type { QuoteEntity } from "../types";
import { useMarket } from "./market";
import { useRelayer } from "./relayer";

interface State {
  data: [number, BN][];
  loading: boolean;
}

export const useQuoteHistory = () => {
  const apolloClient = useApolloClient();
  const { relayerAddress } = useRelayer();
  const { sourceChain, destinationChain } = useMarket();
  const [quoteHistory, setQuoteHistory] = useState<State>({ data: [], loading: false });

  useEffect(() => {
    let sub$$: Subscription | null = null;

    if (isEthChain(sourceChain)) {
      setQuoteHistory((prev) => ({ ...prev, loading: true }));

      sub$$ = from(
        apolloClient.query<
          {
            relayer: {
              quoteHistory: {
                amount: string;
                blockTime: string;
              }[];
            } | null;
          },
          { relayerId: string }
        >({
          query: QUOTE_HISTORY_ETH_DATA,
          variables: {
            relayerId: `${destinationChain}-${relayerAddress.toLowerCase()}`,
          },
          notifyOnNetworkStatusChange: true,
        })
      ).subscribe({
        next: ({ data, loading }) => {
          setQuoteHistory({ data: transformQuoteHistoryEthData(data), loading });
        },
        error: (error) => {
          setQuoteHistory({ data: [], loading: false });
          console.error(error);
        },
      });
    } else if (isPolkadotChain(sourceChain)) {
      setQuoteHistory((prev) => ({ ...prev, loading: true }));

      sub$$ = from(
        apolloClient.query<{ quoteHistory: Pick<QuoteEntity, "data"> | null }, { relayerId: string }>({
          query: QUOTE_HISTORY_POLKADOT_DATA,
          variables: {
            relayerId: `${destinationChain}-${relayerAddress}`,
          },
          notifyOnNetworkStatusChange: true,
        })
      ).subscribe({
        next: ({ data, loading }) => {
          setQuoteHistory({ data: transformQuoteHistoryPolkadotData(data), loading });
        },
        error: (error) => {
          setQuoteHistory({ data: [], loading: false });
          console.error(error);
        },
      });
    }

    return () => {
      sub$$?.unsubscribe();
      setQuoteHistory({ data: [], loading: false });
    };
  }, [sourceChain, destinationChain, relayerAddress, apolloClient]);

  return { quoteHistory };
};
