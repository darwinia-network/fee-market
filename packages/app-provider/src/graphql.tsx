import { PropsWithChildren, useMemo } from "react";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@feemarket/app-utils";
import { useFeeMarket } from "@feemarket/app-hooks";
import { POLKADOT_CHAIN_CONF } from "@feemarket/app-config";

export const GraphqlProvider = ({ children }: PropsWithChildren<unknown>) => {
  const { market } = useFeeMarket();

  const client = useMemo(
    () =>
      new ApolloClient({
        uri: POLKADOT_CHAIN_CONF[market.source].graphql.endpoint,
        cache: new InMemoryCache(),
      }),
    [market]
  );

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};