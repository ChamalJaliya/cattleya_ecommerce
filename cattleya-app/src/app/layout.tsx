import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: 'swap',
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
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased bg-white text-gray-900">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#16a34a',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
