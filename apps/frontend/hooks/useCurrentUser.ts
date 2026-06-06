'use client';

import { ME_QUERY } from "@/lib/graphql/queries";
import { AuthUser } from "@/lib/graphql/types";
import { useQuery } from "@apollo/client/react";

interface MeQueryResponse {
    me: AuthUser;
}

export default function useCurrentUser() {
    const {data, loading, error} = useQuery<MeQueryResponse>(ME_QUERY);
    return {
        user: data?.me ?? null,
        loading,
        error
    }
}