'use client';

import React, { useEffect, useState } from 'react';
import AttributeForm from '../AttributeForm';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';

const EditAttributePage = () => {
  const router = useRouter();
  const params = useParams();
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttribute = async () => {
      try {
        const res = await fetch(`/api/attributes/${params.id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch attribute');
        }
        const response = await res.json();
        
        // Extract the actual attribute data from the response
        const attributeData = response.data || response;
        
        console.log('Raw API response:', response);
        console.log('Attribute data:', attributeData);
        
        // Map the data to match the form structure
        const mappedData = {
          name: attributeData.name || '',
          code: attributeData.code || '',
          type: attributeData.type || 'TEXT',
          description: attributeData.description || '',
          isRequired: attributeData.isRequired || false,
          isFilterable: attributeData.isFilterable || false,
          isSearchable: attributeData.isSearchable || false,
          isComparable: attributeData.isComparable || false,
          isVisible: attributeData.isVisible !== undefined ? attributeData.isVisible : true,
          isVariantDefining: attributeData.isVariantDefining || false,
          isVariantOverridable: attributeData.isVariantOverridable || false,
          defaultValue: attributeData.defaultValue || '',
          options: Array.isArray(attributeData.options) 
            ? attributeData.options.map((opt: any) => ({
                value: opt.value || opt,
                label: opt.label || opt,
                isDefault: opt.isDefault || false
              }))
            : [],
          validationRules: attributeData.validationRules || '',
          sortOrder: attributeData.sortOrder || 0
        };
        
        console.log('Mapped data:', mappedData);
        setInitialData(mappedData);
      } catch (error) {
        console.error('Failed to fetch attribute:', error);
        toast.error('Failed to fetch attribute data');
        router.push('/admin/attributes');
      } finally {
        setLoading(false);
      }
    };
    
    if (params.id) {
      fetchAttribute();
    }
  }, [params.id, router]);

  const handleSubmit = async (data: any) => {
    try {
      const res = await fetch(`/api/attributes/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        throw new Error('Failed to update attribute');
      }
      
      toast.success('Attribute updated successfully!');
      router.push('/admin/attributes');
    } catch (error) {
      console.error('Failed to update attribute:', error);
      toast.error('Failed to update attribute');
    }
  };

  const handleCancel = () => {
    router.push('/admin/attributes');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-purple-400 opacity-20"></div>
        </div>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Attribute Not Found</h2>
          <button
            onClick={() => router.push('/admin/attributes')}
            className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors"
          >
            Back to Attributes
          </button>
        </div>
      </div>
    );
  }

  return (
    <AttributeForm 
      mode="edit" 
      initialData={initialData} 
      onSubmit={handleSubmit} 
      onCancel={handleCancel} 
    />
  );
};

export default EditAttributePage; 