import { notFound } from "next/navigation";
import { apiServer } from "@/lib/api";
import type { Product } from "@/types/domain";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";

export const revalidate = 60;

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  try {
    const resolvedParams = await params;
    const res = await apiServer(`/products/${resolvedParams.id}`);
    const product = res.data as Product | undefined;

    if (!product) {
      notFound();
    }

    return <ProductDetailClient product={product} />;
  } catch {
    notFound();
  }
}
