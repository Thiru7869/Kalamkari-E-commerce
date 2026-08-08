import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Marcellus, Mulish, Noto_Sans_Telugu } from 'next/font/google';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { SmoothScrollProvider } from '@/components/providers/smooth-scroll-provider';
import { ServiceWorkerRegistrar } from '@/components/providers/service-worker-registrar';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { MobileTabBar } from '@/components/layout/mobile-tab-bar';
import { FloatingDock } from '@/components/layout/floating-dock';
import { FirstVisit } from '@/components/welcome/first-visit';
import { site } from '@/content/site';
import { absoluteUrl } from '@/lib/utils';
import './globals.css';

/**
 * Display face: Cormorant Garamond. A Garamond revival — old-style, high
 * contrast, with the thin-to-thick modulation of a nib rather than a machine.
 * It is the closest typographic relative of a bamboo kalam on cloth, and it
 * carries long narrative headings (the ones this site is built out of) without
 * turning them into advertising.
 */
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
});

/**
 * Inscriptional face: Marcellus. Roman capitals, used only for eyebrows, the
 * wordmark and step numerals — the places that behave like an inscription on a
 * temple wall rather than a sentence. One weight, because carved letters have
 * one weight.
 */
const marcellus = Marcellus({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400'],
  variable: '--font-inscription',
});

/**
 * Body face: Mulish. A humanist sans with rounded terminals and a tall
 * x-height — it stays warm beside the serif and stays legible at 15px on a
 * phone in daylight, which is where most of this site is read.
 */
const mulish = Mulish({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

/** Telugu, for the local names of categories and materials. */
const notoTelugu = Noto_Sans_Telugu({
  subsets: ['telugu'],
  display: 'swap',
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
      className={`${cormorant.variable} ${marcellus.variable} ${mulish.variable} ${notoTelugu.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-background">
        <a href="#main" className="skip-link">
          Skip to main content
        </a>

        <ThemeProvider>
          <SmoothScrollProvider>
            <SiteHeader />
            <main id="main" className="min-h-[60vh] pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
              {children}
            </main>
            <SiteFooter />
            <MobileTabBar />
            <FloatingDock />
            {/* The doorway, then the walk-through. Both code-split and never
                requested for a returning visitor. */}
            <FirstVisit />
          </SmoothScrollProvider>

          <Toaster
            position="bottom-center"
            // Clear of the phone tab bar.
            offset={88}
            toastOptions={{
              classNames: {
                toast: 'font-sans rounded-sm border border-border bg-card text-card-foreground',
                description: 'text-muted-foreground',
              },
            }}
          />
          <ServiceWorkerRegistrar />
        </ThemeProvider>
      </body>
    </html>
  );
}
