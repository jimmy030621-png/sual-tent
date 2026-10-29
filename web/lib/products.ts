import catalog from "@/data/products.json";

/* ------------------------------------------------------------------ types */

export type CategorySlug = "tents" | "canopies" | "accessories";

export interface Spec {
  label: string;
  value: string;
}

export interface Variant {
  size?: string;
  unit?: string;
  weightKg?: string;
  packing?: string;
  carton?: string;
  qtyPerCarton?: string;
  fabric?: string;
  notes?: string;
}

export interface Product {
  id: string;
  category: CategorySlug;
  nameEn: string;
  nameZh: string;
  coating?: string | null;
  images: string[];
  variants: Variant[];
  fabric?: string;
  poles?: string;
  accessories?: string;
  bag?: string;
  notes?: string;
  specs?: Spec[];
}

export interface Category {
  slug: CategorySlug;
  name: string;
  tagline: string;
}

interface CatalogData {
  generatedAt: string;
  source: string;
  categories: Category[];
  products: Product[];
}

/* --------------------------------------------------------------- access */

const data = catalog as unknown as CatalogData;

export const categories = data.categories;

export const allProducts: Product[] = data.products;

export const generatedAt = data.generatedAt;

export function getProduct(id: string): Product | undefined {
  return allProducts.find((p) => p.id === id);
}

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function productsByCategory(slug: string): Product[] {
  return allProducts.filter((p) => p.category === slug);
}

export function categoryCount(slug: string): number {
  return productsByCategory(slug).length;
}

/** Deterministic homepage selection: real photos first, spread across lines. */
export function getFeaturedProducts(limit = 8): Product[] {
  const withImages = allProducts.filter((p) => p.images.length > 0);
  const picked: Product[] = [];
  const perCategory = new Map<string, number>();
  for (const p of withImages) {
    const n = perCategory.get(p.category) ?? 0;
    if (n >= Math.ceil(limit / categories.length)) continue;
    picked.push(p);
    perCategory.set(p.category, n + 1);
    if (picked.length >= limit) break;
  }
  return picked;
}

export function getRelated(product: Product, limit = 4): Product[] {
  return allProducts
    .filter((p) => p.id !== product.id && p.category === product.category)
    .sort((a, b) => (b.images.length > 0 ? 1 : 0) - (a.images.length > 0 ? 1 : 0))
    .slice(0, limit);
}

export function variantLabel(v: Variant): string {
  return v.size ?? v.unit ?? "";
}

/** First distinguishable label for a product (used on cards). */
export function productSizeHint(p: Product): string {
  const labels = p.variants.map(variantLabel).filter(Boolean);
  if (labels.length === 0) return "";
  const unique = [...new Set(labels)];
  if (unique.length === 1) return unique[0];
  return `${unique[0]} … ${unique[unique.length - 1]} (${p.variants.length} options)`;
}
