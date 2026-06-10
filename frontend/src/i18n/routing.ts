import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["en", "ro"],
  defaultLocale: "en",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];

export const localeLabels: Record<Locale, string> = {
  en: "English",
  ro: "Română",
};

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
