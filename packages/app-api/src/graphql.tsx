import { PropsWithChildren, useMemo } from "react";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import { useMarket } from "@feemarket/market";
import { isEthChain, isPolkadotChain, getEthChainConfig, getPolkadotChainConfig } from "@feemarket/utils";

export const GraphqlProvider = ({ children }: PropsWithChildren<unknown>) => {
  const { currentMarket } = useMarket();

  const sourceChain = currentMarket?.source;

  const client = useMemo(() => {
    let uri = "";

    if (isEthChain(sourceChain)) {
      uri = getEthChainConfig(sourceChain).graphql.endpoint;
    } else if (isPolkadotChain(sourceChain)) {
      uri = getPolkadotChainConfig(sourceChain).graphql.endpoint;
    }

    return new ApolloClient({
      uri,
      cache: new InMemoryCache(),
    });
  }, [sourceChain]);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
