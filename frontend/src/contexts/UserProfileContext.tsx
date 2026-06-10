"use client";

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
    useCallback,
} from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface ApiKeyEntry {
    configured: boolean;
    source: "user" | "env" | null;
}

export interface UserProfile {
    displayName: string | null;
    organisation: string | null;
    messageCreditsUsed: number;
    creditsResetDate: string | null;
    creditsRemaining: number;
    tier: string;
    titleModel: string | null;
    tabularModel: string;
    email: string | null;
    claudeApiKey: string | null;
    geminiApiKey: string | null;
    apiKeys: Record<string, ApiKeyEntry>;
}

interface UserProfileContextType {
    profile: UserProfile | null;
    loading: boolean;
    updateDisplayName: (name: string) => Promise<boolean>;
    updateOrganisation: (organisation: string) => Promise<boolean>;
    updateModelPreference: (
        field: "tabularModel",
        value: string,
    ) => Promise<boolean>;
    updateApiKey: (
        provider: string,
        value: string | null,
    ) => Promise<boolean>;
    reloadProfile: () => Promise<void>;
    incrementMessageCredits: () => Promise<boolean>;
}

const API_BASE = "https://misu-api.mihailnica10.workers.dev";

const MONTHLY_CREDIT_LIMIT = 999999;

async function apiGet<T>(path: string): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        credentials: "include",
        headers: {
            Accept: "application/json",
        },
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `API error: ${res.status}`);
    }
    return res.json();
}

async function apiPatch<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `API error: ${res.status}`);
    }
    return res.json();
}

async function apiPut<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        method: "PUT",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `API error: ${res.status}`);
    }
    return res.json();
}

async function getProfile(): Promise<Record<string, unknown>> {
    return apiGet("/user/profile");
}

async function updateProfile(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return apiPatch("/user/profile", payload);
}

async function getApiKeyStatus(): Promise<Record<string, boolean>> {
    return apiGet("/user/api-keys");
}

async function saveApiKey(provider: string, value: string | null) {
    // If removing a key, just record it as removed by setting empty
    return apiPut(`/user/api-keys/${provider}`, {
        api_key: value || "",
    });
}

function buildProfile(
    profileData: Record<string, unknown>,
    apiKeyStatus: Record<string, boolean>,
): UserProfile {
    const creditsUsed = (profileData.messageCreditsUsed as number) ?? 0;
    const apiKeys: Record<string, ApiKeyEntry> = {};
    for (const provider of [
        "claude",
        "gemini",
        "openai",
        "openrouter",
        "courtlistener",
    ]) {
        const configured = apiKeyStatus[provider] ?? false;
        apiKeys[provider] = { configured, source: configured ? "user" : null };
    }
    return {
        displayName: (profileData.displayName as string) ?? null,
        organisation: (profileData.organisation as string) ?? null,
        messageCreditsUsed: creditsUsed,
        creditsResetDate: (profileData.creditsResetDate as string) ?? null,
        creditsRemaining: Math.max(MONTHLY_CREDIT_LIMIT - creditsUsed, 0),
        tier: (profileData.tier as string) || "Free",
        titleModel: (profileData.titleModel as string) ?? null,
        tabularModel:
            (profileData.tabularModel as string) || "gemini-3-flash-preview",
        email: (profileData.email as string) ?? null,
        claudeApiKey: apiKeys["claude"]?.configured ? "••••••••" : null,
        geminiApiKey: apiKeys["gemini"]?.configured ? "••••••••" : null,
        apiKeys,
    };
}

function defaultProfile(): UserProfile {
    const futureResetDate = new Date();
    futureResetDate.setDate(futureResetDate.getDate() + 30);
    const defaultApiKeys: Record<string, ApiKeyEntry> = {};
    for (const p of [
        "claude",
        "gemini",
        "openai",
        "openrouter",
        "courtlistener",
    ]) {
        defaultApiKeys[p] = { configured: false, source: null };
    }
    return {
        displayName: null,
        organisation: null,
        messageCreditsUsed: 0,
        creditsResetDate: futureResetDate.toISOString(),
        creditsRemaining: MONTHLY_CREDIT_LIMIT,
        tier: "Free",
        titleModel: null,
        tabularModel: "gemini-3-flash-preview",
        email: null,
        claudeApiKey: null,
        geminiApiKey: null,
        apiKeys: defaultApiKeys,
    };
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(
    undefined,
);

export function UserProfileProvider({ children }: { children: ReactNode }) {
    const { user, isAuthenticated } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const loadProfile = useCallback(async () => {
        try {
            const [profileData, keyStatus] = await Promise.all([
                getProfile(),
                getApiKeyStatus(),
            ]);
            setProfile(buildProfile(profileData, keyStatus));
        } catch (e) {
            console.error("Failed to load profile:", e);
            setProfile(defaultProfile());
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated && user) {
            setLoading(true);
            loadProfile();
        } else {
            setProfile(null);
            setLoading(false);
        }
    }, [isAuthenticated, user, loadProfile]);

    const updateDisplayName = useCallback(
        async (displayName: string): Promise<boolean> => {
            try {
                const updated = await updateProfile({ displayName });
                const keyStatus = await getApiKeyStatus();
                setProfile(buildProfile(updated, keyStatus));
                return true;
            } catch {
                return false;
            }
        },
        [],
    );

    const updateOrganisation = useCallback(
        async (organisation: string): Promise<boolean> => {
            try {
                const updated = await updateProfile({ organisation });
                const keyStatus = await getApiKeyStatus();
                setProfile(buildProfile(updated, keyStatus));
                return true;
            } catch {
                return false;
            }
        },
        [],
    );

    const updateModelPreference = useCallback(
        async (field: "tabularModel", value: string): Promise<boolean> => {
            try {
                const payload: Record<string, unknown> = {};
                payload[field] = value;
                const updated = await updateProfile(payload);
                const keyStatus = await getApiKeyStatus();
                setProfile(buildProfile(updated, keyStatus));
                return true;
            } catch {
                return false;
            }
        },
        [],
    );

    const updateApiKey = useCallback(
        async (provider: string, value: string | null): Promise<boolean> => {
            try {
                await saveApiKey(provider, value);
                const [profileData, keyStatus] = await Promise.all([
                    getProfile(),
                    getApiKeyStatus(),
                ]);
                setProfile(buildProfile(profileData, keyStatus));
                return true;
            } catch {
                return false;
            }
        },
        [],
    );

    const reloadProfile = useCallback(async () => {
        if (user) {
            await loadProfile();
        }
    }, [user, loadProfile]);

    const incrementMessageCredits = useCallback(async (): Promise<boolean> => {
        if (!profile || profile.creditsRemaining <= 0) return false;
        try {
            const newCreditsUsed = profile.messageCreditsUsed + 1;
            setProfile((prev) =>
                prev
                    ? {
                          ...prev,
                          messageCreditsUsed: newCreditsUsed,
                          creditsRemaining:
                              MONTHLY_CREDIT_LIMIT - newCreditsUsed,
                      }
                    : null,
            );
            return true;
        } catch {
            return false;
        }
    }, [profile]);

    return (
        <UserProfileContext.Provider
            value={{
                profile,
                loading,
                updateDisplayName,
                updateOrganisation,
                updateModelPreference,
                updateApiKey,
                reloadProfile,
                incrementMessageCredits,
            }}
        >
            {children}
        </UserProfileContext.Provider>
    );
}

export function useUserProfile() {
    const context = useContext(UserProfileContext);
    if (context === undefined) {
        throw new Error(
            "useUserProfile must be used within a UserProfileProvider",
        );
    }
    return context;
}
