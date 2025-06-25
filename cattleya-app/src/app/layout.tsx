import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import ClientWrapper from "./ClientWrapper";
import Link from "next/link";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: {
    default: "Cattleya - Premium Orchid Collection",
    template: "%s | Cattleya",
  },
  description: "Discover the finest collection of premium orchids. From rare species to popular varieties, find your perfect orchid companion at Cattleya.",
  keywords: ["orchids", "plants", "flowers", "cattleya", "premium", "collection", "rare", "species"],
  authors: [{ name: "Cattleya Team" }],
  creator: "Cattleya",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Cattleya - Premium Orchid Collection",
    description: "Discover the finest collection of premium orchids. From rare species to popular varieties, find your perfect orchid companion.",
    siteName: "Cattleya",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cattleya - Premium Orchid Collection",
    description: "Discover the finest collection of premium orchids. From rare species to popular varieties, find your perfect orchid companion.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-white text-gray-900 min-h-screen" suppressHydrationWarning>
        <ClientWrapper>
          {children}
        </ClientWrapper>
        <div id="modal-portal"></div>
      </body>
    </html>
  );
}
