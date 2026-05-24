import { ApolloClient, InMemoryCache, HttpLink, ApolloLink, from } from "@apollo/client";

const authLink = new ApolloLink((operation, forward) => {
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('token='))
    ?.split('=')[1];

  operation.setContext({
    headers: {
      authorization: token ? `Bearer ${token}` : ''
    }
  });

  return forward(operation);
});

export function makeClient() {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: from([
      authLink,
      new HttpLink({
        uri: process.env.NEXT_PUBLIC_GRAPHQL_URL
      })
    ])
  });
}