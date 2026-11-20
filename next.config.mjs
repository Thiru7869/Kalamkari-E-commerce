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
      // The shop is the home page. Permanent (308), and Next carries the query
      // string across, so /shop?motif=… and /shop?sort=… keep working.
      // /shop/<category> is a separate route and is unaffected.
      { source: '/shop', destination: '/', permanent: true },
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
          {
            // Report-only to begin with. Turning this into an enforcing
            // `Content-Security-Policy` is a one-word change, but it should be
            // made only after a period of watching real traffic — a CSP that
            // blocks a payment widget is worse than no CSP at all.
            //
            // Two allowances are load-bearing and not laziness:
            //
            //   'unsafe-inline' in script-src — the JSON-LD blocks on the home,
            //   product and contact pages are inline <script> tags, and Next's
            //   own bootstrap is inline too. Removing it needs a nonce plumbed
            //   through middleware, which is the natural next step once the
            //   report stream is quiet.
            //
            //   'unsafe-eval' — three.js compiles shader programs at runtime.
            //
            // Everything else is closed: no plugins, no framing, no form posts
            // to another origin, and connect/img/frame limited to what the site
            // actually uses (Razorpay's checkout when payments are switched on).
            key: 'Content-Security-Policy-Report-Only',
            value: [
              "default-src 'self'",
              "base-uri 'self'",
              "object-src 'none'",
              "frame-ancestors 'self'",
              "form-action 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com",
              "frame-src https://api.razorpay.com https://checkout.razorpay.com",
              "worker-src 'self' blob:",
              "manifest-src 'self'",
              /*
                `upgrade-insecure-requests` is deliberately absent.

                The spec says it is ignored when delivered in a report-only
                policy, and Chrome says so out loud: every page load logged
                "The Content Security Policy directive
                'upgrade-insecure-requests' is ignored when delivered in a
                report-only policy" to the console. A directive that does
                nothing but print an error on every navigation is worse than
                no directive, because it trains everyone to ignore the console.

                Add it back in the same commit that promotes this header to an
                enforcing `Content-Security-Policy`, where it starts working.
              */
            ].join('; '),
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
