import { useCallback, useEffect, useMemo } from "react";
import { BN } from "@polkadot/util";
import {
  RELAYER_REWARD_SLASH_ETH_DATA,
  RELAYER_REWARD_SLASH_POLKADOT_DATA,
  QUOTE_HISTORY_ETH_DATA,
  QUOTE_HISTORY_POLKADOT_DATA,
  RELAYER_ORDERS_ETH_DATA,
  RELAYER_ORDERS_POLKADOT_DATA,
} from "@feemarket/config";
import {
  transformRewardAndSlashEthData,
  transformRewardAndSlashPolkadotData,
  transformQuoteHistoryEthData,
  transformQuoteHistoryPolkadotData,
  transformRelayerRelatedOrdersEthData,
  transformRelayerRelatedOrdersPolkadotData,
} from "@feemarket/utils";
import type { RelayerOrdersDataSource } from "@feemarket/utils";
import { useMarket } from "@feemarket/market";
import type { SlashEntity, RewardEntity, QuoteEntity, OrderEntity } from "@feemarket/config";
import { useGrapgQuery } from "./graphQuery";

interface Params {
  relayerAddress: string;
}

export const useRelayerDetailData = ({ relayerAddress }: Params) => {
  const { currentMarket, setRefresh } = useMarket();
  const destinationChain = currentMarket?.destination;

  const {
    transformedData: rewardAndSlashEthData,
    loading: rewardAndSlashEthDataLoading,
    refetch: updateRewardAndSlashEthData,
  } = useGrapgQuery<
    {
      relayer: {
        slashes: Pick<SlashEntity, "amount" | "blockTime">[] | null;
        rewards: Pick<RewardEntity, "amount" | "blockTime">[] | null;
      } | null;
    },
    { relayerId: string },
    { rewards: [number, BN][]; slashs: [number, BN][] }
  >(
    RELAYER_REWARD_SLASH_ETH_DATA,
    {
      variables: {
        relayerId: `${destinationChain}-${relayerAddress}`,
      },
    },
    transformRewardAndSlashEthData
  );

  const {
    transformedData: rewardAndSlashPolkadotData,
    loading: rewardAndSlashPolkadotDataLoading,
    refetch: updateRewardAndSlashPolkadotData,
  } = useGrapgQuery<
    {
      relayer: {
        slashes: { nodes: Pick<SlashEntity, "amount" | "blockTime">[] } | null;
        rewards: { nodes: Pick<RewardEntity, "amount" | "blockTime">[] } | null;
      } | null;
    },
    { relayerId: string },
    { rewards: [number, BN][]; slashs: [number, BN][] }
  >(
    RELAYER_REWARD_SLASH_POLKADOT_DATA,
    {
      variables: {
        relayerId: `${destinationChain}-${relayerAddress}`,
      },
    },
    transformRewardAndSlashPolkadotData
  );

  const rewardAndSlashDataLoading = useMemo(() => {
    return rewardAndSlashEthDataLoading ?? rewardAndSlashPolkadotDataLoading ?? false;
  }, [rewardAndSlashEthDataLoading, rewardAndSlashPolkadotDataLoading]);

  const rewardAndSlashData = useMemo<{
    rewards: [number, BN][];
    slashs: [number, BN][];
  }>(() => {
    if (rewardAndSlashEthData?.slashs.length || rewardAndSlashEthData?.rewards.length) {
      return rewardAndSlashEthData;
    }
    if (rewardAndSlashPolkadotData?.slashs.length || rewardAndSlashPolkadotData?.rewards.length) {
      return rewardAndSlashPolkadotData;
    }
    return { rewards: [], slashs: [] };
  }, [rewardAndSlashPolkadotData]);

  const updateRewardAndSlashData = useCallback(() => {
    updateRewardAndSlashEthData();
    updateRewardAndSlashPolkadotData();
  }, [updateRewardAndSlashEthData, updateRewardAndSlashPolkadotData]);

  const {
    transformedData: quoteHistoryEthData,
    loading: quoteHistoryEthDataLoading,
    refetch: updateQuoteHistoryEthData,
  } = useGrapgQuery<
    {
      relayer: {
        quoteHistory: {
          amount: string;
          blockTime: string;
        }[];
      } | null;
    },
    { relayerId: string },
    [number, BN][]
  >(
    QUOTE_HISTORY_ETH_DATA,
    {
      variables: {
        relayerId: `${destinationChain}-${relayerAddress}`,
      },
    },
    transformQuoteHistoryEthData
  );

  const {
    transformedData: quoteHistoryPolkadotData,
    loading: quoteHistoryPolkadotDataLoading,
    refetch: updateQuoteHistoryPolkadotData,
  } = useGrapgQuery<{ quoteHistory: Pick<QuoteEntity, "data"> | null }, { relayerId: string }, [number, BN][]>(
    QUOTE_HISTORY_POLKADOT_DATA,
    {
      variables: {
        relayerId: `${destinationChain}-${relayerAddress}`,
      },
    },
    transformQuoteHistoryPolkadotData
  );

  const quoteHistoryDataLoading = useMemo(() => {
    return quoteHistoryEthDataLoading ?? quoteHistoryPolkadotDataLoading ?? false;
  }, [quoteHistoryEthDataLoading, quoteHistoryPolkadotDataLoading]);

  const quoteHistoryData = useMemo(() => {
    if (quoteHistoryEthData?.length) {
      return quoteHistoryEthData;
    }
    if (quoteHistoryPolkadotData?.length) {
      return quoteHistoryPolkadotData;
    }
    return [];
  }, [quoteHistoryEthData, quoteHistoryPolkadotData]);

  const updateQuoteHistoryData = useCallback(() => {
    updateQuoteHistoryEthData();
    updateQuoteHistoryPolkadotData();
  }, [updateQuoteHistoryEthData, updateQuoteHistoryPolkadotData]);

  const {
    transformedData: relayerRelatedOrdersEthData,
    loading: relayerRelatedOrdersEthDataLoading,
    refetch: updateRlayerRelatedOrdersEthData,
  } = useGrapgQuery<
    {
      relayer?: {
        slashes:
          | (Pick<SlashEntity, "amount" | "relayerRole"> & {
              order: Pick<OrderEntity, "lane" | "nonce" | "createBlockTime"> | null;
            })[]
          | null;
        rewards:
          | (Pick<SlashEntity, "amount" | "relayerRole"> & {
              order: Pick<OrderEntity, "lane" | "nonce" | "createBlockTime"> | null;
            })[]
          | null;
      } | null;
    },
    { relayerId: string },
    RelayerOrdersDataSource[]
  >(
    RELAYER_ORDERS_ETH_DATA,
    {
      variables: {
        relayerId: `${destinationChain}-${relayerAddress}`,
      },
    },
    transformRelayerRelatedOrdersEthData
  );

  const {
    transformedData: relayerRelatedOrdersPolkadotData,
    loading: relayerRelatedOrdersPolkadotDataLoading,
    refetch: updateRlayerRelatedOrdersPolkadotData,
  } = useGrapgQuery<
    {
      relayer?: {
        slashes: {
          nodes: (Pick<SlashEntity, "amount" | "relayerRole"> & {
            order: Pick<OrderEntity, "lane" | "nonce" | "createBlockTime"> | null;
          })[];
        } | null;
        rewards: {
          nodes: (Pick<SlashEntity, "amount" | "relayerRole"> & {
            order: Pick<OrderEntity, "lane" | "nonce" | "createBlockTime"> | null;
          })[];
        } | null;
      } | null;
    },
    { relayerId: string },
    RelayerOrdersDataSource[]
  >(
    RELAYER_ORDERS_POLKADOT_DATA,
    {
      variables: {
        relayerId: `${destinationChain}-${relayerAddress}`,
      },
    },
    transformRelayerRelatedOrdersPolkadotData
  );

  const relayerRelatedOrdersDataLoading = useMemo(() => {
    return relayerRelatedOrdersEthDataLoading ?? relayerRelatedOrdersPolkadotDataLoading ?? false;
  }, [relayerRelatedOrdersEthDataLoading, relayerRelatedOrdersPolkadotDataLoading]);

  const relayerRelatedOrdersData = useMemo(() => {
    if (relayerRelatedOrdersEthData?.length) {
      return relayerRelatedOrdersEthData;
    }
    if (relayerRelatedOrdersPolkadotData?.length) {
      return relayerRelatedOrdersPolkadotData;
    }
    return [];
  }, [relayerRelatedOrdersEthData, relayerRelatedOrdersPolkadotData]);

  const updateRlayerRelatedOrdersData = useCallback(() => {
    updateRlayerRelatedOrdersEthData();
    updateRlayerRelatedOrdersPolkadotData();
  }, [updateRlayerRelatedOrdersEthData, updateRlayerRelatedOrdersPolkadotData]);

  useEffect(() => {
    setRefresh(() => () => {
      updateRewardAndSlashData();
      updateQuoteHistoryData();
      updateRlayerRelatedOrdersData();
    });
  }, [setRefresh, updateRewardAndSlashData, updateQuoteHistoryData, updateRlayerRelatedOrdersData]);

  return {
    rewardAndSlashDataLoading,
    rewardAndSlashData,
    quoteHistoryDataLoading,
    quoteHistoryData,
    relayerRelatedOrdersDataLoading,
    relayerRelatedOrdersData,
  };
};
