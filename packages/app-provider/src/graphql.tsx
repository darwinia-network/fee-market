import { PropsWithChildren, useMemo } from "react";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import { useFeeMarket } from "@feemarket/app-hooks";
import { POLKADOT_CHAIN_CONF } from "@feemarket/app-config";

export const GraphqlProvider = ({ children }: PropsWithChildren<unknown>) => {
  const { market } = useFeeMarket();

  const lol = POLKADOT_CHAIN_CONF[market.source].graphql.endpoint;
  console.log(lol);

  const client = useMemo(
    () =>
      new ApolloClient({
        uri: "",
        cache: new InMemoryCache(),
      }),
    [market]
  );

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
