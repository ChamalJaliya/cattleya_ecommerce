import ProductEditClient from './ProductEditClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  return <ProductEditClient params={resolvedParams} />;
} 