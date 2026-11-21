import type { Metadata, Viewport } from 'next';
import { Fraunces, Plus_Jakarta_Sans, Noto_Sans_Telugu } from 'next/font/google';
import { LazyToaster } from '@/components/providers/lazy-toaster';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { SmoothScrollProvider } from '@/components/providers/smooth-scroll-provider';
import { ServiceWorkerRegistrar } from '@/components/providers/service-worker-registrar';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { Suspense } from 'react';
import { MobileTabBar } from '@/components/layout/mobile-tab-bar';
import { BagCount } from '@/components/layout/tab-bar-bag-count';
import { CartDrawerSlot } from '@/components/cart/cart-drawer-slot';
import { FloatingDock } from '@/components/layout/floating-dock';
import { PageTransition } from '@/components/motion/page-transition';
import { site } from '@/content/site';
import { absoluteUrl } from '@/lib/utils';
import './globals.css';

/**
 * Two families, not three.
 *
 * The previous set — Cormorant Garamond, Marcellus and Mulish — was three
 * faces doing the work of two, and the display face was the weak one: a
 * Garamond revival is a *book* type, and its thin strokes get thinner as the
 * size goes up, so the largest words on the site were also the palest. On a
 * page whose whole argument is a bold factual claim, the claim was being set
 * in a whisper.
 *
 * Display face: **Fraunces**. A variable old-style with a soft/wonk axis pair
 * held at zero, so it keeps the nib modulation that belongs beside hand-drawn
 * line work but reaches a genuine 700 without falling apart. It is the one
 * face on the site allowed to be loud.
 */
const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  style: ['normal', 'italic'],
  variable: '--font-display',
});

/**
 * Everything else: **Plus Jakarta Sans**. A geometric humanist with a tall
 * x-height and open apertures — minimal, contemporary, and legible at 15px on
 * a phone in daylight, which is where most of this site is read.
 *
 * It carries two roles. As `--font-body` it sets every paragraph. As
 * `--font-inscription` it also sets the eyebrows, the wordmark's second line
 * and the step numerals, where it runs at 600 in tracked capitals. Those
 * places used to take Marcellus, a third family loaded for about forty short
 * labels; tracked caps in a geometric sans say the same thing with one fewer
 * font request and read as *official* rather than as archaeological.
 */
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

/*
  There were four faces here for a while. The fourth was **Kalam**, a
  handwriting family used for the company name alone, chosen to match the hand
  lettering on the store's visiting card and brochure.

  It has been removed. A script face is the wrong tool for a wordmark that has
  to be legible at 15px in a phone header, and the ornaments that came with it
  — a drawn flourish and a leaf — made four competing marks inside one 200px
  block. The name is now set in Fraunces, whose nib modulation says
  "drawn by hand" in a way that survives being set small, and the mark beside
  it is a single nib. See `src/components/layout/wordmark.tsx`.

  Deleting it takes a whole font request off every page on the site.
*/

/** Telugu, for the local names of categories and materials. */
const notoTelugu = Noto_Sans_Telugu({
  subsets: ['telugu'],
  display: 'swap',
  // Not preloaded, and not referenced until the page has loaded: two weights of
  // Telugu were about 150 KB on the type pages, requested alongside the images
  // and scripts the first paint is waiting for, to set two decorative words.
  preload: false,
  weight: ['400', '600'],
  variable: '--font-telugu',
});

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl()),
  title: {
    default: `${site.name} — Hand-painted Kalamkari, Srikalahasti`,
    template: `%s · ${site.shortName} Kalamkari`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    'Kalamkari',
    'Srikalahasti Kalamkari',
    'pen Kalamkari',
    'hand-painted saree',
    'natural dye saree',
    'vegetable dye Kalamkari',
    'Andhra Pradesh handicraft',
    'Kalamkari painting',
    'handmade Kalamkari dupatta',
  ],
  authors: [{ name: site.name }],
  creator: site.name,
  publisher: site.name,
  formatDetection: { telephone: true, address: false, email: false },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: absoluteUrl(),
    siteName: site.name,
    title: `${site.name} — Hand-painted Kalamkari, Srikalahasti`,
    description: site.description,
    images: [
      {
        url: '/images/og/default.jpg',
        width: 1200,
        height: 630,
        alt: 'A hand-painted Kalamkari cloth in madder red and iron black on myrobalan-cream cotton.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: site.name,
    description: site.description,
    images: ['/images/og/default.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: site.shortName,
    statusBarStyle: 'default',
  },
  alternates: { canonical: '/' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Never lock zoom — pinch-zoom is an accessibility requirement, and the
  // app-like feel is not worth taking it away.
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F4EDE0' },
    { media: '(prefers-color-scheme: dark)', color: '#161311' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-IN"
      className={`${fraunces.variable} ${jakarta.variable} ${notoTelugu.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-background">
        {/*
          Resolves the announcement bar before first paint.

          It is rendered server-side so the header never shifts down when it
          appears; this removes it for anybody who has closed it, in the same
          frame, so they never see it flash. Same technique next-themes uses
          for the theme, and for the same reason.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('svl_announce')==='1'){document.documentElement.dataset.announce='closed'}}catch(e){}" +
              "addEventListener('load',function(){setTimeout(function(){document.documentElement.classList.add('telugu-ready')},800)});",
          }}
        />

        <a href="#main" className="skip-link">
          Skip to main content
        </a>

        <ThemeProvider>
          <SmoothScrollProvider>
            <SiteHeader />
            <main id="main" className="min-h-[60vh] pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
              <PageTransition>{children}</PageTransition>
            </main>
            <SiteFooter />
            <MobileTabBar
              bagCount={
                <Suspense fallback={null}>
                  <BagCount />
                </Suspense>
              }
            />
            <Suspense fallback={null}>
              <CartDrawerSlot />
            </Suspense>
            <FloatingDock />
          </SmoothScrollProvider>

          <LazyToaster />
          <ServiceWorkerRegistrar />
        </ThemeProvider>
      </body>
    </html>
  );
}
