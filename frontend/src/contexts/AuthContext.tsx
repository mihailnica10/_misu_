"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { authClient } from "@/lib/auth-client";

interface User {
    id: string;
    email: string;
    name?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    authLoading: boolean;
    signOut: () => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const { data: session, isPending } = authClient.useSession();

    const user: User | null = session?.user
        ? { id: session.user.id, email: session.user.email, name: session.user.name }
        : null;

    const signOut = async () => {
        await authClient.signOut();
    };

    const login = async (email: string, password: string) => {
        const { data, error } = await authClient.signIn.email({
            email,
            password,
        });
        if (error) throw new Error(error.message || "Login failed");
    };

    const signup = async (email: string, password: string, name: string) => {
        const { data, error } = await authClient.signUp.email({
            email,
            password,
            name: name || email.split("@")[0],
        });
        if (error) throw new Error(error.message || "Signup failed");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                authLoading: isPending,
                signOut,
                login,
                signup,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
