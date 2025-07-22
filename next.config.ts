import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // Webpack optimization for vendor chunks
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Optimize client-side chunks
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Vendor chunk for React ecosystem
            react: {
              name: 'react-vendor',
              test: /[\\/]node_modules[\\/](react|react-dom|react-router)[\\/]/,
              chunks: 'all',
              priority: 40,
            },
            // UI libraries chunk
            ui: {
              name: 'ui-vendor',
              test: /[\\/]node_modules[\\/](@radix-ui|lucide-react|framer-motion|class-variance-authority|clsx|tailwind-merge)[\\/]/,
              chunks: 'all',
              priority: 30,
            },
            // Utilities chunk
            utils: {
              name: 'utils-vendor',
              test: /[\\/]node_modules[\\/](uuid|jose|next-themes)[\\/]/,
              chunks: 'all',
              priority: 20,
            },
            // Default vendor chunk for other libraries
            vendor: {
              name: 'vendor',
              test: /[\\/]node_modules[\\/]/,
              chunks: 'all',
              priority: 10,
            },
            // Common chunks for shared code
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 5,
            },
          },
        },
      };
    }
    return config;
  },

  // Output optimization
  output: 'standalone',

  // Disable X-Powered-By header
  poweredByHeader: false,

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

// Wrap with bundle analyzer if ANALYZE is enabled
const withBundleAnalyzer =
  process.env.ANALYZE === 'true'
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('@next/bundle-analyzer')({ enabled: true })
    : (config: NextConfig) => config;

export default withBundleAnalyzer(nextConfig);
