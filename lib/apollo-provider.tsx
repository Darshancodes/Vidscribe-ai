"use client";

import { ApolloProvider as BaseApolloProvider } from "@apollo/client";
import { getClient } from "@/lib/apollo-client";

export function ApolloProvider({ children }: { children: React.ReactNode }) {
  const client = getClient();
  return <BaseApolloProvider client={client}>{children}</BaseApolloProvider>;
}