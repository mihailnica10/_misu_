import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  /* config options here */
  // reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/sitemap.xml",
        destination: "/api/sitemap/sitemap.xml",
      },
      {
        source: "/sitemap_:slug.xml",
        destination: "/api/sitemap/sitemap_:slug.xml",
      },
    ];
  },
  skipTrailingSlashRedirect: true,
};

export default withNextIntl(nextConfig);
