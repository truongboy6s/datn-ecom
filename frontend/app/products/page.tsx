import { apiServer } from "@/lib/api";
import type { Product } from "@/types/domain";
import { ProductsClient } from "@/components/product/ProductsClient";

export const revalidate = 60;

export default async function ProductsPage() {
  const res = await apiServer("/products?page=1&limit=10");
  const products = (res.data?.docs || []) as Product[];

  return <ProductsClient initialProducts={products} />;
}
