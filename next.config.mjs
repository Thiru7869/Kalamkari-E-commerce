/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // three.js and its ecosystem ship untranspiled ESM; let Next handle it.
  transpilePackages: ['three'],

  images: {
    formats: ['image/avif', 'image/webp'],
    // Studio photography is portrait-heavy (sarees on the loom, hanging panels),
    // so the small end of the ladder is denser than Next's default.
    deviceSizes: [360, 420, 640, 768, 1024, 1280, 1600, 1920],
    imageSizes: [64, 96, 128, 200, 256, 384, 512],
  },

  experimental: {
    optimizePackageImports: ['lucide-react', '@react-three/drei'],
  },

  async redirects() {
    return [
      // The page moved from /commission to /custom when the nav label changed.
      // Permanent, because the old URL was live and is linked from elsewhere.
      { source: '/commission', destination: '/custom', permanent: true },
    ];
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
      {
        // The service worker must never be cached, or installed clients get stuck
        // on a stale shell after a deploy.
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ];
  },
};

export default nextConfig;
