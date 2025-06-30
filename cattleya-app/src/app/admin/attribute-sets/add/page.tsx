'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  PlusIcon,
  TrashIcon,
  StarIcon,
  CogIcon,
  CommandLineIcon,
  CpuChipIcon,
  PuzzlePieceIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  CubeIcon,
  GlobeAltIcon,
  ListBulletIcon,
  ArrowLeftIcon,
  XMarkIcon,
  SparklesIcon,
  RectangleStackIcon,
  TagIcon,
  CheckIcon,
  SwatchIcon,
  ArchiveBoxIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '@/shared/components/layouts/AdminLayout';
import AdminBreadcrumb from '@/shared/components/AdminBreadcrumb';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import AttributeSetForm from '../AttributeSetForm';

interface Attribute {
  id: string;
  name: string;
  code: string;
  type: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'COLOR' | 'SIZE' | 'SELECT' | 'MULTISELECT';
  description?: string;
  isRequired: boolean;
  isFilterable: boolean;
  isSearchable: boolean;
  isComparable: boolean;
  isVisible: boolean;
  options?: string[];
  sortOrder: number;
}

interface AttributeSetFormData {
  name: string;
  code: string;
  description: string;
  attributeIds: string[];
  isActive: boolean;
  sortOrder: number;
}

const AddAttributeSetPage = () => {
  const router = useRouter();
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<AttributeSetFormData>({
    name: '',
    code: '',
    description: '',
    attributeIds: [],
    isActive: true,
    sortOrder: 0,
  });

  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        const response = await axios.get('/api/attributes');
        const attrs = Array.isArray(response.data?.data) ? response.data.data : [];
        setAttributes(attrs);
      } catch (error) {
        console.error('Failed to fetch attributes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAttributes();
  }, []);

  const handleSubmit = async (data: AttributeSetFormData) => {
    try {
      await axios.post('/api/attribute-sets', data);
      toast.success('Attribute set created successfully!');
      router.push('/admin/attribute-sets');
    } catch (error) {
      console.error('Failed to create attribute set:', error);
      toast.error('Failed to create attribute set');
    }
  };

  const handleCancel = () => {
    router.push('/admin/attribute-sets');
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-purple-400 opacity-20"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  console.log('Attributes passed to form:', attributes);

  return (
    <AttributeSetForm
      mode="add"
      formData={formData}
      allAttributes={attributes}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
};

export default AddAttributeSetPage; 