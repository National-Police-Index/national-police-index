import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}>
        <div className="min-h-full w-5/6 mx-auto flex flex-col">
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
