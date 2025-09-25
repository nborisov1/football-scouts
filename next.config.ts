import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    esmExternals: 'loose'
  },
  // Fix CORS/COEP issues for Firebase Storage
  async headers() {
    return [
      {
        // Allow cross-origin for Firebase Storage videos
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none'
          }
        ]
      }
    ]
  },
  webpack: (config, { isServer }) => {
    // Fix for Firebase on server-side
    if (isServer) {
      config.externals = [...(config.externals || []), {
        'firebase/app': 'firebase/app',
        'firebase/auth': 'firebase/auth',
        'firebase/firestore': 'firebase/firestore',
        'firebase/storage': 'firebase/storage'
      }]
    }

    return config
  }
};

export default nextConfig;
