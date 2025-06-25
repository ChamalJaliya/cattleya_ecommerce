'use client';

import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/core/application/stores/useAuthStore';
import CartSidebar from '@/shared/components/CartSidebar';
import Header from '@/shared/components/Header';
import { themeColors } from '@/shared/utils/toast';

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { checkAuth } = useAuthStore();
  const pathname = usePathname();
  
  // Show header only on specific public pages
  const allowedPaths = [
    '/',
    '/about',
    '/contact',
    '/products',
  ];
  // Allow /products/[id] (product detail)
  const isProductDetail = pathname.startsWith('/products/') && pathname.split('/').length === 3;
  const showHeader = allowedPaths.includes(pathname) || isProductDetail;

  useEffect(() => {
    // Check authentication status on app load
    checkAuth();
  }, [checkAuth]);

  return (
    <>
      {showHeader && <Header />}
      {children}
      <CartSidebar />
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            color: '#1f2937',
            fontSize: '14px',
            fontWeight: '500',
            padding: '12px 16px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            minWidth: '300px',
            maxWidth: '400px',
          },
          success: {
            iconTheme: {
              primary: themeColors.success.light,
              secondary: '#ffffff',
            },
            style: {
              borderLeft: `4px solid ${themeColors.success.light}`,
              background: `linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(52, 211, 153, 0.1) 100%)`,
            },
          },
          error: {
            iconTheme: {
              primary: themeColors.error.light,
              secondary: '#ffffff',
            },
            style: {
              borderLeft: `4px solid ${themeColors.error.light}`,
              background: `linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(248, 113, 113, 0.1) 100%)`,
            },
          },
          loading: {
            iconTheme: {
              primary: themeColors.primary.light,
              secondary: '#ffffff',
            },
            style: {
              borderLeft: `4px solid ${themeColors.primary.light}`,
              background: `linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)`,
            },
          },
        }}
      />
    </>
  );
} 