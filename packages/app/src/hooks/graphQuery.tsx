import { useQuery } from "@apollo/client";
import type {
  DocumentNode,
  OperationVariables,
  TypedDocumentNode,
  QueryHookOptions,
  QueryResult,
} from "@apollo/client";

export const useGrapgQuery: <TData = unknown, TVariables = OperationVariables, TTransResult = unknown>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: QueryHookOptions<TData, TVariables>,
  transform?: (data: TData) => TTransResult
) => Pick<QueryResult<TData, TVariables>, "data" | "loading" | "refetch"> & { transformedData?: TTransResult } = (
  query,
  options,
  transform
) => {
  const { data, loading, refetch } = useQuery(query, {
    notifyOnNetworkStatusChange: true,
    ...options,
  });

  return {
    data,
    loading,
    transformedData: data && transform ? transform(data) : undefined,
    refetch,
  };
};
