import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['fs-extra', 'tree-kill'],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    // Reduit l'utilisation memoire des workers
    workerThreads: false,
    cpus: 1,
  },
};

export default withNextIntl(nextConfig);