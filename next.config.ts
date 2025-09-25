import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    esmExternals: 'loose'
  },
  // Fix CORS/COEP issues for Firebase Storage and enable SharedArrayBuffer for FFmpeg.wasm
  async headers() {
    return [
      {
        // Enable SharedArrayBuffer for video transcoding (FFmpeg.wasm)
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp'
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin'
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

    // Configure for FFmpeg.wasm
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      }
    }

    return config
  }
};

export default nextConfig;
