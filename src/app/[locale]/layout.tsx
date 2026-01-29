import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SenStudioHost - WhatsApp Bot Hosting",
  description: "Déployez vos bots WhatsApp en quelques secondes.",
  icons: {
    icon: [
      { url: '/icon.jpg' },
      { url: 'https://i.postimg.cc/3Jh4vg9T/sen-logo-dark.jpg', sizes: '32x32', type: 'image/jpeg' },
    ],
    shortcut: 'https://i.postimg.cc/3Jh4vg9T/sen-logo-dark.jpg',
    apple: 'https://i.postimg.cc/3Jh4vg9T/sen-logo-dark.jpg',
  },
  openGraph: {
    title: "Sen Studio Host",
    description: "Déployez vos bots WhatsApp en quelques secondes.",
    url: 'https://sen-host.com',
    siteName: 'Sen Studio Host',
    images: [
      {
        url: 'https://i.postimg.cc/3Jh4vg9T/sen-logo-dark.jpg',
        width: 1200,
        height: 630,
        alt: 'Sen Studio Host Logo',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sen Studio Host',
    description: 'Déployez vos bots WhatsApp en quelques secondes.',
    images: ['https://i.postimg.cc/3Jh4vg9T/sen-logo-dark.jpg'],
  },
};

import StickyFooterAd from "@/components/ads/StickyFooterAd";
import SocialBarAd from "@/components/ads/SocialBarAd";

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
 
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
 
  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <div className="bg-orange-500 text-white p-4 text-center font-bold sticky top-0 z-50 shadow-md">
                ⚠️ Maintenance : Une mise à jour a été effectuée. Si votre bot est arrêté, veuillez le redémarrer depuis votre tableau de bord.
              </div>
              {children}
              <StickyFooterAd />
              <SocialBarAd />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}