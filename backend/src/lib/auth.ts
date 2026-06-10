import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db/schema";

export function createAuth(d1: D1Database, env: { BETTER_AUTH_SECRET?: string; BETTER_AUTH_URL?: string }) {
    const secret = env.BETTER_AUTH_SECRET;
    if (!secret) throw new Error("BETTER_AUTH_SECRET is required");

    const db = drizzle(d1, { schema });

    return betterAuth({
        database: drizzleAdapter(db, {
            provider: "sqlite",
            schema: {
                user: schema.user,
                session: schema.session,
                account: schema.account,
                verification: schema.verification,
            },
        }),
        secret,
        baseURL: env.BETTER_AUTH_URL || "http://localhost:8787",

        emailAndPassword: {
            enabled: true,
            autoSignIn: true,
        },

        advanced: {
            defaultCookieAttributes: {
                sameSite: "none",
                secure: true,
                partitioned: true,
            },
            database: {
                generateId: () => crypto.randomUUID(),
            },
        },

        session: {
            expiresIn: 60 * 60 * 24 * 7, // 7 days
            updateAge: 60 * 60 * 24, // refresh every 24h
            cookieCache: {
                enabled: true,
                maxAge: 5 * 60, // 5 min cache
            },
        },

        trustedOrigins: ["https://misu-legal.mihailnica10.workers.dev"],
    });
}
