import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GoogleAnalytics } from '@next/third-parties/google';
import "./globals.scss";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "National Police Index | Search Police Officer Records",
  description: "Search and explore police officer employment records, certification status, and disciplinary actions across the United States.",
  keywords: "police records, law enforcement, police certification, police employment history",
  authors: [{ name: "National Police Index" }],
  creator: "National Police Index",
  publisher: "National Police Index",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nationalpoliceindex.org",
    siteName: "National Police Index",
    title: "National Police Index | Search Police Officer Records",
    description: "Search and explore police officer employment records, certification status, and disciplinary actions across the United States.",
  },
  twitter: {
    card: "summary_large_image",
    title: "National Police Index | Search Police Officer Records",
    description: "Search and explore police officer employment records, certification status, and disciplinary actions across the United States.",
  },
};

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AnalyticsProvider from '@/components/AnalyticsProvider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} antialiased h-full`}>
        <AnalyticsProvider>
          <div className="min-h-fulld flex flex-col wrapper">
            <Header />
            <main className="flex-grow w-full ">
              {children}
            </main>
            <Footer />
          </div>
        </AnalyticsProvider>
        {process.env.NEXT_PUBLIC_GA_TRACKING_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_TRACKING_ID} />
        )}
      </body>
    </html>
  );
}
