import { PropsWithChildren, useMemo } from "react";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@feemarket/app-utils";
import { POLKADOT_CHAIN_CONF } from "@feemarket/app-config";
import { useFeeMarket } from "./feemarket";

export const GraphqlProvider = ({ children }: PropsWithChildren<unknown>) => {
  const { market } = useFeeMarket();

  const client = useMemo(
    () =>
      new ApolloClient({
        uri: market?.source ? POLKADOT_CHAIN_CONF[market.source].graphql.endpoint : "",
        cache: new InMemoryCache(),
      }),
    [market?.source]
  );

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export { useApolloClient, useQuery } from "@feemarket/app-utils";