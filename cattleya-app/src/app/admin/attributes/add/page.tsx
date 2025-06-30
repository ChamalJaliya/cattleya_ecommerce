'use client';

import React from 'react';
import AttributeForm from '../AttributeForm';
import { useRouter } from 'next/navigation';

const AddAttributePage = () => {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    // Call API to create attribute
    await fetch('/api/attributes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    router.push('/admin/attributes');
  };

  return (
    <AttributeForm mode="add" onSubmit={handleSubmit} onCancel={() => router.push('/admin/attributes')} />
  );
};

export default AddAttributePage; 