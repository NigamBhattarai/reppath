'use client';

import { makeClient } from "@/lib/apollo/client";
import { useState } from "react";
import React from "react";
import { ApolloProvider } from "@apollo/client/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(makeClient);

  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
}