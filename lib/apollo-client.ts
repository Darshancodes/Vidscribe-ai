import {
    ApolloClient,
    InMemoryCache,
    createHttpLink,
    NormalizedCacheObject,
    gql,
  } from "@apollo/client";
  import fetch from "cross-fetch";
  
  let client: ApolloClient<NormalizedCacheObject> | null = null;
  
  export function getClient() {
    if (!client || typeof window === "undefined") {
      client = new ApolloClient({
        link: createHttpLink({
          uri: process.env.GRAPHQL_API_URL || "https://vidscribe-ai-darshannn.hypermode.app/graphql",
          credentials: "include",
          fetch,
          headers: {
            "Content-Type": "application/json",
          },
        }),
        cache: new InMemoryCache(),
        defaultOptions: {
          query: {
            fetchPolicy: "no-cache",
            errorPolicy: "all",
          },
        },
        ssrMode: typeof window === "undefined",
      });
    }
    return client;
  }
  
  export async function executeGraphQLQuery(query: any, variables: any) {
    try {
      const client = getClient();
      console.log("started creating");
  
      const { data, errors } = await client.query({
        query: query,
        variables,
      });
  
      if (errors) {
        throw new Error(errors.map((e) => e.message).join(", "));
      }
  
      return data;
    } catch (error) {
      console.error("GraphQL Query Error:", error);
      throw error;
    }
  }
  
  // lib/apollo-client.ts
  // import {
  //   ApolloClient,
  //   InMemoryCache,
  //   createHttpLink,
  //   NormalizedCacheObject,
  // } from "@apollo/client";
  // import fetch from "cross-fetch";
  
  // let client: ApolloClient<NormalizedCacheObject> | null = null;
  
  // export function getClient() {
  //   if (!client || typeof window === "undefined") {
  //     client = new ApolloClient({
  //       link: createHttpLink({
  //         uri: "http://localhost:8686/graphql",
  //         credentials: "omit",
  //         fetch,
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       }),
  //       cache: new InMemoryCache(),
  //       defaultOptions: {
  //         query: {
  //           fetchPolicy: "no-cache",
  //           errorPolicy: "all",
  //         },
  //       },
  //       ssrMode: true,
  //     });
  //   }
  //   return client;
  // }
  
  // // Helper function for making GraphQL queries
  // export async function executeGraphQLQuery<T>(
  //   query: any,
  //   variables: any
  // ): Promise<T> {
  //   const client = getClient();
  
  //   try {
  //     const { data, errors } = await client.query({
  //       query,
  //       variables,
  //       fetchPolicy: "no-cache",
  //     });
  
  //     if (errors) {
  //       throw new Error(errors[0].message);
  //     }
  
  //     return data;
  //   } catch (error) {
  //     console.error("GraphQL Error:", error);
  //     throw error;
  //   }
  // }
  
  // Function to create Apollo Client instance
  // function makeClient() {
  //   const httpLink = createHttpLink({
  //     uri: "http://localhost:8686/graphql",
  //     credentials: "omit",
  //     fetch, // Use cross-fetch for server-side
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   });
  
  //   return new ApolloClient({
  //     link: httpLink,
  //     cache: new InMemoryCache(),
  //     defaultOptions: {
  //       query: {
  //         fetchPolicy: "no-cache", // Better for server actions
  //         errorPolicy: "all",
  //       },
  //       watchQuery: {
  //         fetchPolicy: "no-cache",
  //         errorPolicy: "all",
  //       },
  //     },
  //     // Enable SSR mode when running on server
  //     ssrMode: typeof window === "undefined",
  //   });
  // }
  // export default makeClient;
  
  // const httpLink = createHttpLink({
  //   uri: "http://localhost:8686/graphql",
  //   credentials: "omit", // Changed from 'include' to 'omit' to avoid CORS issues
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  // });
  
  // const client = new ApolloClient({
  //   link: httpLink,
  //   cache: new InMemoryCache(),
  //   defaultOptions: {
  //     watchQuery: {
  //       fetchPolicy: "cache-and-network",
  //     },
  //   },
  // });
  
  // export default client;