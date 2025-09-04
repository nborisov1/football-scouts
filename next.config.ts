import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    esmExternals: 'loose'
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
