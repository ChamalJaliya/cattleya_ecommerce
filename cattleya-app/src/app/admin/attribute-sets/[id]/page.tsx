'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  type: string;
  description?: string;
  isRequired: boolean;
  isFilterable: boolean;
  isSearchable: boolean;
  isComparable?: boolean;
  isVisible?: boolean;
  options?: any[];
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

const EditAttributeSetPage = () => {
  const router = useRouter();
  const params = useParams();
  const setId = params.id as string;
  
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<AttributeSetFormData | null>(null);

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

  useEffect(() => {
    if (setId) {
      fetchData();
    }
  }, [setId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [attrRes, setRes] = await Promise.all([
        axios.get('/api/attributes'),
        axios.get(`/api/attribute-sets/${setId}`)
      ]);
      
      const attrs = Array.isArray(attrRes.data?.data) ? attrRes.data.data : [];
      setAttributes(attrs);
      
      // The response is { data: [ ... ] }, so extract the first item
      const setArr = setRes.data?.data;
      const set = Array.isArray(setArr) ? setArr[0] : setArr;
      if (!set) throw new Error('Attribute set not found');
      setFormData({
        name: set.name || '',
        code: set.code || '',
        description: set.description || '',
        attributeIds: Array.isArray(set.attributes) ? set.attributes.map((a: any) => a.id) : [],
        isActive: set.isActive !== undefined ? set.isActive : true,
        sortOrder: set.sortOrder || 0
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to fetch attribute set data');
      router.push('/admin/attribute-sets');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: AttributeSetFormData) => {
    try {
      await axios.put(`/api/attribute-sets/${setId}`, data);
      toast.success('Attribute set updated successfully!');
      router.push('/admin/attribute-sets');
    } catch (error) {
      console.error('Failed to update attribute set:', error);
      toast.error('Failed to update attribute set');
    }
  };

  const handleCancel = () => {
    router.push('/admin/attribute-sets');
  };

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Attribute Sets', href: '/admin/attribute-sets' },
    { label: 'Edit Attribute Set', href: '#' }
  ];

  if (loading || !formData) {
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

  return (
    <AttributeSetForm
      mode="edit"
      formData={formData}
      allAttributes={attributes}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
};

export default EditAttributeSetPage; 