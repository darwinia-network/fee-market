import { BN } from "@polkadot/util";
import { useEffect, useState } from "react";
import { Subscription, from } from "rxjs";
import { useApolloClient } from "@apollo/client";
import { isEthChain, isPolkadotChain } from "../utils";
import { useMarket } from "./market";
import type { SlashEntity, RewardEntity } from "../types";
import { RELAYER_REWARD_SLASH_ETH_DATA, RELAYER_REWARD_SLASH_POLKADOT_DATA } from "../config";
import { useRelayer } from "./relayer";
import { transformRewardAndSlashEthData, transformRewardAndSlashPolkadotData } from "../utils";

interface State {
  rewards: [number, BN][];
  slashs: [number, BN][];
  loading: boolean;
}

export const useRewardSlash = () => {
  const apolloClient = useApolloClient();
  const { sourceChain, destinationChain } = useMarket();
  const { relayerAddress } = useRelayer();
  const [rewardSlash, setRewardSlash] = useState<State>({ rewards: [], slashs: [], loading: false });

  useEffect(() => {
    let sub$$: Subscription | null = null;

    if (isEthChain(sourceChain)) {
      setRewardSlash((prev) => ({ ...prev, loading: true }));

      sub$$ = from(
        apolloClient.query<
          {
            relayer: {
              slashes: Pick<SlashEntity, "amount" | "blockTime">[] | null;
              rewards: Pick<RewardEntity, "amount" | "blockTime">[] | null;
            } | null;
          },
          { relayerId: string }
        >({
          query: RELAYER_REWARD_SLASH_ETH_DATA,
          variables: {
            relayerId: `${destinationChain}-${relayerAddress.toLowerCase()}`,
          },
          notifyOnNetworkStatusChange: true,
        })
      ).subscribe({
        next: ({ data, loading }) => {
          setRewardSlash({ ...transformRewardAndSlashEthData(data), loading });
        },
        error: (error) => {
          setRewardSlash({ rewards: [], slashs: [], loading: false });
          console.error(error);
        },
      });
    } else if (isPolkadotChain(sourceChain)) {
      setRewardSlash((prev) => ({ ...prev, loading: true }));

      sub$$ = from(
        apolloClient.query<
          {
            relayer: {
              slashes: { nodes: Pick<SlashEntity, "amount" | "blockTime">[] } | null;
              rewards: { nodes: Pick<RewardEntity, "amount" | "blockTime">[] } | null;
            } | null;
          },
          { relayerId: string }
        >({
          query: RELAYER_REWARD_SLASH_POLKADOT_DATA,
          variables: {
            relayerId: `${destinationChain}-${relayerAddress}`,
          },
          notifyOnNetworkStatusChange: true,
        })
      ).subscribe({
        next: ({ data, loading }) => {
          setRewardSlash({ ...transformRewardAndSlashPolkadotData(data), loading });
        },
        error: (error) => {
          setRewardSlash({ rewards: [], slashs: [], loading: false });
          console.error(error);
        },
      });
    }

    return () => {
      sub$$?.unsubscribe();
      setRewardSlash({ rewards: [], slashs: [], loading: false });
    };
  }, [sourceChain, destinationChain, relayerAddress, apolloClient]);

  return { rewardSlash };
};
