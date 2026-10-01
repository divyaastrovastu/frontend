import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { Providers } from '@/components/Providers';
import { businessConfig } from '@/lib/businessConfig';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: `DIVYA ASTRO VASTU | ${businessConfig.astrologerName}`,
    template: `%s | DIVYA ASTRO VASTU`,
  },
  description: businessConfig.description,
  metadataBase: new URL(businessConfig.websiteUrl),
  icons: {
    icon: [{ url: '/favicon.ico' }, { url: '/images/logo.png', type: 'image/png' }],
    apple: [{ url: '/images/logo.png' }],
    shortcut: '/favicon.ico',
  },
  openGraph: {
    title: 'DIVYA ASTRO VASTU',
    description: businessConfig.tagline,
    url: businessConfig.websiteUrl,
    siteName: 'DIVYA ASTRO VASTU',
    locale: 'en_IN',
    type: 'website',
    images: [{ url: '/images/logo.png', width: 1024, height: 1051, alt: 'DIVYA ASTRO VASTU' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
