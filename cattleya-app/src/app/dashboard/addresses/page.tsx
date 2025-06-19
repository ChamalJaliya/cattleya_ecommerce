'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardAddressesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/customer/addresses');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to addresses...</p>
      </div>
    </div>
  );
} 