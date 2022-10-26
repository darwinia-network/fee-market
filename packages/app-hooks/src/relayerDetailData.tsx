import { useGrapgQuery } from "./graphQuery";
import {
  RELAYER_REWARD_SLASH_ETH,
  RELAYER_REWARD_SLASH_POLKADOT,
  QUOTE_HISTORY_ETH,
  QUOTE_HISTORY_POLKADOT,
  RELAYER_ORDERS_ETH,
  RELAYER_ORDERS_POLKADOT,
} from "@feemarket/app-config";
import {
  transformEthRelayerRewardSlash,
  transformPolkadotRelayerRewardSlash,
  transformEthRelayerQuotes,
  transformPolkadotRelayerQuotes,
  transformEthRelayerOrders,
  transformPolkadotRelayerOrders,
} from "@feemarket/app-utils";
import type { Market } from "@feemarket/app-provider";
import type {
  SlashEntity,
  RewardEntity,
  QuoteEntity,
  OrderEntity,
  RelayerOrdersDataSource,
} from "@feemarket/app-types";
import { useCallback, useEffect, useMemo } from "react";
import { BN } from "@polkadot/util";

interface Params {
  relayerAddress: string;
  currentMarket: Market | null;
  setRefresh: (fn: () => void) => void;
}

export const useRelayersDetailData = ({ relayerAddress, currentMarket, setRefresh }: Params) => {
  const {
    transformedData: ethRewardAndSlashData,
    loading: ethRewardAndSlashLoading,
    refetch: refetchEthRewardAndSlash,
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
    RELAYER_REWARD_SLASH_ETH,
    {
      variables: {
        relayerId: currentMarket?.destination ? `${currentMarket.destination}-${relayerAddress}` : "",
      },
    },
    transformEthRelayerRewardSlash
  );

  const {
    transformedData: polkadotRewardAndSlashData,
    loading: polkadotRewardAndSlashLoading,
    refetch: refetchPolkadotRewardAndSlash,
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
    RELAYER_REWARD_SLASH_POLKADOT,
    {
      variables: {
        relayerId: currentMarket?.destination ? `${currentMarket.destination}-${relayerAddress}` : "",
      },
    },
    transformPolkadotRelayerRewardSlash
  );

  const rewardAndSlashLoading = useMemo(() => {
    return ethRewardAndSlashLoading ?? polkadotRewardAndSlashLoading ?? false;
  }, [ethRewardAndSlashLoading, polkadotRewardAndSlashLoading]);

  const rewardAndSlashData = useMemo<{
    rewards: [number, BN][];
    slashs: [number, BN][];
  }>(() => {
    if (ethRewardAndSlashData?.slashs.length || ethRewardAndSlashData?.rewards.length) {
      return ethRewardAndSlashData;
    }
    if (polkadotRewardAndSlashData?.slashs.length || polkadotRewardAndSlashData?.rewards.length) {
      return polkadotRewardAndSlashData;
    }
    return { rewards: [], slashs: [] };
  }, [polkadotRewardAndSlashData]);

  const refetchRewardAndSlash = useCallback(() => {
    refetchEthRewardAndSlash();
    refetchPolkadotRewardAndSlash();
  }, [refetchEthRewardAndSlash, refetchPolkadotRewardAndSlash]);

  const {
    transformedData: ethQuoteHistoryData,
    loading: ethQuoteHistoryLoading,
    refetch: refetchEthQuoteHistory,
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
    QUOTE_HISTORY_ETH,
    {
      variables: {
        relayerId: currentMarket?.destination ? `${currentMarket.destination}-${relayerAddress}` : "",
      },
    },
    transformEthRelayerQuotes
  );

  const {
    transformedData: polkadotQuoteHistoryData,
    loading: polkadotQuoteHistoryLoading,
    refetch: refetchPolkadotQuoteHistory,
  } = useGrapgQuery<{ quoteHistory: Pick<QuoteEntity, "data"> | null }, { relayerId: string }, [number, BN][]>(
    QUOTE_HISTORY_POLKADOT,
    {
      variables: {
        relayerId: currentMarket?.destination ? `${currentMarket.destination}-${relayerAddress}` : "",
      },
    },
    transformPolkadotRelayerQuotes
  );

  const quoteHistoryLoading = useMemo(() => {
    return ethQuoteHistoryLoading ?? polkadotQuoteHistoryLoading ?? false;
  }, [ethQuoteHistoryLoading, polkadotQuoteHistoryLoading]);

  const quoteHistoryData = useMemo(() => {
    if (ethQuoteHistoryData?.length) {
      return ethQuoteHistoryData;
    }
    if (polkadotQuoteHistoryData?.length) {
      return polkadotQuoteHistoryData;
    }
    return [];
  }, [ethQuoteHistoryData, polkadotQuoteHistoryData]);

  const refetchQuoteHistory = useCallback(() => {
    refetchEthQuoteHistory();
    refetchPolkadotQuoteHistory();
  }, [refetchEthQuoteHistory, refetchPolkadotQuoteHistory]);

  const {
    transformedData: ethRelayerRelatedOrdersData,
    loading: ethRelayerRelatedOrdersLoading,
    refetch: refetchEthRelayerRelatedOrders,
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
    RELAYER_ORDERS_ETH,
    {
      variables: {
        relayerId: currentMarket?.destination ? `${currentMarket.destination}-${relayerAddress}` : "",
      },
    },
    transformEthRelayerOrders
  );

  const {
    transformedData: polkadotRelayerRelatedOrdersData,
    loading: polkadotRelayerRelatedOrdersLoading,
    refetch: refetchPolkadotRelayerRelatedOrders,
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
    RELAYER_ORDERS_POLKADOT,
    {
      variables: {
        relayerId: currentMarket?.destination ? `${currentMarket.destination}-${relayerAddress}` : "",
      },
    },
    transformPolkadotRelayerOrders
  );

  const relayerRelatedOrdersLoading = useMemo(() => {
    return ethRelayerRelatedOrdersLoading ?? polkadotRelayerRelatedOrdersLoading ?? false;
  }, [ethRelayerRelatedOrdersLoading, polkadotRelayerRelatedOrdersLoading]);

  const relayerRelatedOrdersData = useMemo(() => {
    if (ethRelayerRelatedOrdersData?.length) {
      return ethRelayerRelatedOrdersData;
    }
    if (polkadotRelayerRelatedOrdersData?.length) {
      return polkadotRelayerRelatedOrdersData;
    }
    return [];
  }, [ethRelayerRelatedOrdersData, polkadotRelayerRelatedOrdersData]);

  const refetchRelayerRelatedOrders = useCallback(() => {
    refetchEthRelayerRelatedOrders();
    refetchPolkadotRelayerRelatedOrders();
  }, [refetchEthRelayerRelatedOrders, refetchPolkadotRelayerRelatedOrders]);

  useEffect(() => {
    setRefresh(() => () => {
      refetchRewardAndSlash();
      refetchQuoteHistory();
      refetchRelayerRelatedOrders();
    });
  }, [setRefresh, refetchRewardAndSlash, refetchQuoteHistory, refetchRelayerRelatedOrders]);

  return {
    rewardAndSlashLoading,
    rewardAndSlashData,
    quoteHistoryLoading,
    quoteHistoryData,
    relayerRelatedOrdersLoading,
    relayerRelatedOrdersData,
  };
};
