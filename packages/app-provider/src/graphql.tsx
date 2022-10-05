import { PropsWithChildren, useMemo } from "react";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import { POLKADOT_CHAIN_CONF } from "@feemarket/app-config";
import { useFeeMarket } from "./feemarket";

export const GraphqlProvider = ({ children }: PropsWithChildren<unknown>) => {
  const { currentMarket } = useFeeMarket();

  const client = useMemo(
    () =>
      new ApolloClient({
        uri: currentMarket?.source ? POLKADOT_CHAIN_CONF[currentMarket.source].graphql.endpoint : "",
        cache: new InMemoryCache(),
      }),
    [currentMarket?.source]
  );

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
