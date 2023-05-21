import { useQuery } from "@apollo/client";
import { MARKET_SUMMARY } from "../config";
import type { FeeMarketChain, MarketEntity } from "../types";
import { useMarket } from "./market";
import { BN, bnToBn } from "@polkadot/util";

interface State {
  value: BN | null | undefined;
  loading: boolean;
}

export const useTotalReward = () => {
  const { currentMarket } = useMarket();
  const destinationChain = currentMarket?.destination;

  const { loading, data } = useQuery<
    { market: Pick<MarketEntity, "totalReward"> | null },
    { destination: FeeMarketChain | undefined }
  >(MARKET_SUMMARY, {
    notifyOnNetworkStatusChange: true,
    variables: {
      destination: destinationChain,
    },
  });

  return {
    totalReward: { loading, value: data?.market?.totalReward ? bnToBn(data.market.totalReward) : null } as State,
  };
};
