"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { SiteLogo } from "@/components/site-logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Scale, FileText, Shield, Globe } from "lucide-react";

type FeatureIcon = typeof Scale;

interface FeatureDef {
  icon: FeatureIcon;
  titleKey: string;
  descKey: string;
}

const features: FeatureDef[] = [
  { icon: Scale, titleKey: "features_ai_title", descKey: "features_ai_desc" },
  { icon: FileText, titleKey: "features_docs_title", descKey: "features_docs_desc" },
  { icon: Shield, titleKey: "features_compliance_title", descKey: "features_compliance_desc" },
  { icon: Globe, titleKey: "features_i18n_title", descKey: "features_i18n_desc" },
];

export default function LandingPage() {
  const t = useTranslations("landing");

  return (
    <div className="min-h-dvh bg-white flex flex-col">
      {/* Navigation */}
      <nav className="w-full border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <SiteLogo size="md" asLink />
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              {t("nav_login")}
            </Link>
            <Link href="/signup">
              <Button className="bg-black hover:bg-gray-900 text-white text-sm px-5">
                {t("nav_signup")}
              </Button>
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1">
        <div className="max-w-6xl mx-auto px-6 pt-24 md:pt-32 pb-16 md:pb-24">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-eb-garamond font-medium text-gray-900 leading-tight mb-6">
              {t("hero_title")}{" "}
              <span className="text-blue-600">{t("hero_title_accent")}</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-10 max-w-2xl">
              {t("hero_subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button className="bg-black hover:bg-gray-900 text-white text-base px-8 py-6">
                  {t("get_started")}
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 text-base px-8 py-6 hover:bg-gray-50"
                >
                  {t("sign_in")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-gray-100 bg-gray-50/50">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <h2 className="text-3xl md:text-4xl font-eb-garamond font-medium text-gray-900 mb-4 text-center">
            {t("features_title")}
          </h2>
          <p className="text-gray-500 text-center mb-16 max-w-xl mx-auto">
            {t("features_subtitle")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature) => (
              <div
                key={feature.titleKey}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t(feature.titleKey)}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {t(feature.descKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28 text-center">
          <h2 className="text-3xl md:text-4xl font-eb-garamond font-medium text-gray-900 mb-4">
            {t("cta_title")}
          </h2>
          <p className="text-gray-500 mb-10 max-w-lg mx-auto">
            {t("cta_subtitle")}
          </p>
          <Link href="/signup">
            <Button className="bg-black hover:bg-gray-900 text-white text-base px-10 py-6">
              {t("cta_button")}
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
