import { useGrapgQuery } from "./graphQuery";
import { RELAYER_REWARD_SLASH, QUOTE_HISTORY, RELAYER_ORDERS } from "@feemarket/app-config";
import { transformRelayerRewardSlash, transformRelayerQuotes, transformRelayerOrders } from "@feemarket/app-utils";
import type { Market } from "@feemarket/app-provider";
import type {
  SlashEntity,
  RewardEntity,
  QuoteEntity,
  OrderEntity,
  RelayerOrdersDataSource,
} from "@feemarket/app-types";
import { useEffect } from "react";

interface Params {
  relayerAddress: string;
  currentMarket: Market | null;
  setRefresh: (fn: () => void) => void;
}

export const useRelayersDetailData = ({ relayerAddress, currentMarket, setRefresh }: Params) => {
  const { transformedData: rewardAndSlashData, refetch: refetchRewardAndSlash } = useGrapgQuery<
    {
      relayer: {
        slashes: { nodes: Pick<SlashEntity, "amount" | "blockTime">[] } | null;
        rewards: { nodes: Pick<RewardEntity, "amount" | "blockTime">[] } | null;
      } | null;
    },
    { relayerId: string },
    { rewards: [number, number][]; slashs: [number, number][] }
  >(
    RELAYER_REWARD_SLASH,
    {
      variables: {
        relayerId: currentMarket?.destination ? `${currentMarket.destination}-${relayerAddress}` : "",
      },
    },
    transformRelayerRewardSlash
  );

  const { transformedData: quoteHistoryData, refetch: refetchQuoteHistory } = useGrapgQuery<
    { quoteHistory: Pick<QuoteEntity, "data"> | null },
    { relayerId: string },
    [number, number][]
  >(
    QUOTE_HISTORY,
    {
      variables: {
        relayerId: currentMarket?.destination ? `${currentMarket.destination}-${relayerAddress}` : "",
      },
    },
    transformRelayerQuotes
  );

  const { transformedData: relayerRelatedOrdersData, refetch: refetchRelayerRelatedOrders } = useGrapgQuery<
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
    RELAYER_ORDERS,
    {
      variables: {
        relayerId: currentMarket?.destination ? `${currentMarket.destination}-${relayerAddress}` : "",
      },
    },
    transformRelayerOrders
  );

  useEffect(() => {
    setRefresh(() => () => {
      refetchRewardAndSlash();
      refetchQuoteHistory();
      refetchRelayerRelatedOrders();
    });
  }, [setRefresh, refetchRewardAndSlash, refetchQuoteHistory, refetchRelayerRelatedOrders]);

  return { rewardAndSlashData, quoteHistoryData, relayerRelatedOrdersData };
};
