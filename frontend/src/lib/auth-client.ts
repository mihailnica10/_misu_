"use client";

import { createAuthClient } from "better-auth/react";

// Hardcoded — API runs on a subdomain under the same parent domain
// Cookie sharing via crossSubDomainCookies (.mihailnica10.workers.dev)
const API_BASE = "https://misu-api.mihailnica10.workers.dev";

export const authClient = createAuthClient({
    baseURL: API_BASE,
    fetchOptions: {
        credentials: "include",
    },
});

// Re-export types
export type Session = typeof authClient.$Infer.Session;

// Re-export commonly used methods
export const { signIn, signUp, useSession, signOut } = authClient;
