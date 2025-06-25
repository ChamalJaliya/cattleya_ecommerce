"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/shared/components/layouts/AdminLayout';
import { useProductStore } from '@/core/application/stores/useProductStore';
import { Product } from '@/core/domain/entities/Product';
import toast from 'react-hot-toast';

interface ProductEditClientProps {
  params: {
    id: string;
  };
}

export default function ProductEditClient({ params }: ProductEditClientProps) {
  const router = useRouter();
  const { products, loading, fetchProducts, updateProduct } = useProductStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadProduct();
  }, [params.id]);

  const loadProduct = async () => {
    const existingProduct = products.find(p => p.id === params.id);
    if (existingProduct) {
      setProduct(existingProduct);
      return;
    }

    await fetchProducts({
      page: 1,
      limit: 100,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });

    const foundProduct = products.find(p => p.id === params.id);
    if (foundProduct) {
      setProduct(foundProduct);
    }
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!product) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Product Not Found</h2>
          <button
            onClick={() => router.push('/admin/products')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go to Products
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Product: {product.name}</h1>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <p className="text-gray-600">Product edit form will be implemented here.</p>
            <p className="text-sm text-gray-500 mt-2">Product ID: {params.id}</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 