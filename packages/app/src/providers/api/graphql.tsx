import { PropsWithChildren, useMemo } from "react";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import { useMarket } from "../../hooks/market";
import { isEthChain, isPolkadotChain, getEthChainConfig, getPolkadotChainConfig } from "../../utils";

export const GraphqlProvider = ({ children }: PropsWithChildren<unknown>) => {
  const { sourceChain } = useMarket();

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
