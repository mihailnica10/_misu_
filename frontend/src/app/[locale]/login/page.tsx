"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { SiteLogo } from "@/components/site-logo";
import { useAuth } from "@/contexts/AuthContext";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Footer } from "@/components/footer";

export default function LoginPage() {
    const t = useTranslations("auth");
    const { isAuthenticated, authLoading, login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // If already authenticated on mount, redirect away
    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            window.location.href = '/en/assistant';
        }
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await login(email, password);
            // Force navigation using multiple methods for reliability
            window.location.assign('/en/assistant');
        } catch (error: any) {
            setError(error.message || t("error_occurred"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-dvh bg-white flex flex-col">
            <div className="flex-1 flex items-start justify-center px-6 pt-32 md:pt-40 pb-10 relative">
                <div className="absolute top-4 md:top-8 left-1/2 -translate-x-1/2">
                    <SiteLogo size="md" className="md:text-4xl" asLink />
                </div>
                <div className="absolute top-4 md:top-8 right-6">
                    <LanguageSwitcher />
                </div>
                <div className="w-full max-w-md">
                    {/* Login Form */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-left text-2xl font-serif">
                                {t("login_title")}
                            </h2>
                            <div className="bg-gray-100 p-1 rounded-md flex text-xs font-medium">
                                <span className="text-gray-600 px-3 py-1 bg-white rounded-sm shadow-sm">
                                    {t("login_tab")}
                                </span>
                                <Link
                                    href="/signup"
                                    className="px-3 py-1 text-gray-500 hover:text-gray-900"
                                >
                                    {t("signup_tab")}
                                </Link>
                            </div>
                        </div>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    {t("email")}
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t("email_placeholder")}
                                    required
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    {t("password")}
                                </label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={t("password_placeholder")}
                                    required
                                    className="w-full"
                                />
                            </div>

                            {error && (
                                <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-5 bg-black hover:bg-gray-900 text-white"
                            >
                                {loading ? t("logging_in") : t("login")}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
