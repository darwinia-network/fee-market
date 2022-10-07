import { PropsWithChildren, useMemo } from "react";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import { ETH_CHAIN_CONF, POLKADOT_CHAIN_CONF } from "@feemarket/app-config";
import { useFeeMarket } from "./feemarket";
import type { FeeMarketSourceChainEth, FeeMarketSourceChainPolkadot } from "@feemarket/app-types";

export const GraphqlProvider = ({ children }: PropsWithChildren<unknown>) => {
  const { currentMarket } = useFeeMarket();

  const client = useMemo(() => {
    let uri = "";

    if (ETH_CHAIN_CONF[currentMarket?.source as FeeMarketSourceChainEth]) {
      uri = ETH_CHAIN_CONF[currentMarket?.source as FeeMarketSourceChainEth].graphql.endpoint;
    } else if (POLKADOT_CHAIN_CONF[currentMarket?.source as FeeMarketSourceChainPolkadot]) {
      uri = POLKADOT_CHAIN_CONF[currentMarket?.source as FeeMarketSourceChainPolkadot].graphql.endpoint;
    }

    return new ApolloClient({
      uri,
      cache: new InMemoryCache(),
    });
  }, [currentMarket?.source]);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
