"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { routing, localeLabels } from "@/i18n/routing";
import { useTransition } from "react";

export function LanguageSwitcher({
  className = "",
}: {
  className?: string;
}) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("language_switcher");

  const handleChange = (nextLocale: string) => {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale as any });
    });
  };

  return (
    <div className={`relative inline-flex items-center gap-1 ${className}`}>
      <span className="text-xs text-muted-foreground">{t("label")}:</span>
      <div className="flex rounded-lg border border-gray-200 overflow-hidden">
        {routing.locales.map((loc) => {
          const isActive = loc === locale;
          return (
            <button
              key={loc}
              onClick={() => handleChange(loc)}
              disabled={isActive || isPending}
              className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
              aria-label={localeLabels[loc]}
            >
              {loc.toUpperCase()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
