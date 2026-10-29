import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductGallery from "@/components/product-gallery";
import ProductCard from "@/components/product-card";
import {
  allProducts,
  getCategory,
  getProduct,
  getRelated,
  variantLabel,
} from "@/lib/products";

export function generateStaticParams() {
  return allProducts.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) return { title: "Product not found" };
  const category = getCategory(product.category);
  return {
    title: product.nameEn,
    description: `${product.nameEn} — ${category?.name ?? "outdoor gear"} from Saul Tents. Factory-direct wholesale & OEM. Request a quote for pricing.`,
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();

  const category = getCategory(product.category);
  const related = getRelated(product);
  const inquiryHref = `/contact?product=${encodeURIComponent(product.id)}`;

  const variantRows = product.variants;
  const hasVariants = variantRows.length > 0;

  return (
    <div className="container-site py-10 lg:py-14">
      {/* breadcrumb */}
      <nav className="mb-6 text-xs text-ink/50" aria-label="Breadcrumb">
        <Link href="/products" className="hover:text-pine-700">Products</Link>
        {category && (
          <>
            <span className="mx-2">/</span>
            <Link href={`/products?category=${category.slug}`} className="hover:text-pine-700">
              {category.name}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-ink/80">{product.nameEn}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <ProductGallery images={product.images} name={product.nameEn} />

        <div>
          <p className="eyebrow">{category?.name ?? "Product"}</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-pine-900 sm:text-4xl">
            {product.nameEn}
          </h1>
          {product.nameZh && product.nameZh !== product.nameEn && (
            <p className="mt-1 text-sm text-ink/45">Catalogue name: {product.nameZh}</p>
          )}

          {product.coating && (
            <span className="mt-4 inline-block rounded-full bg-clay-100 px-3.5 py-1.5 text-xs font-semibold text-clay-700">
              {product.coating} coating
            </span>
          )}

          <p className="mt-5 max-w-xl text-sm leading-relaxed text-ink/65 sm:text-base">
            Factory model with {hasVariants ? `${variantRows.length} size option${variantRows.length > 1 ? "s" : ""}` : "custom sizing"}.
            Wholesale price on request —{" "}
            <Link href={inquiryHref} className="font-medium text-pine-700 underline underline-offset-4">
              send us your quantity
            </Link>{" "}
            for a quotation within 24 hours.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={inquiryHref} className="btn-primary">
              Inquire About This Product
            </Link>
            <Link href="/wholesale" className="btn-outline">
              Wholesale Program
            </Link>
          </div>

          {hasVariants && (
            <div className="mt-9 overflow-hidden rounded-2xl border border-cream-200 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-cream-200 bg-cream-100/60 text-[11px] uppercase tracking-[0.12em] text-pine-800">
                      <th className="px-4 py-3 font-semibold">Size / Unit</th>
                      <th className="px-4 py-3 font-semibold">Weight</th>
                      <th className="px-4 py-3 font-semibold">Packing</th>
                      <th className="px-4 py-3 font-semibold">Carton Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variantRows.map((v, i) => (
                      <tr key={i} className="border-b border-cream-200/70 last:border-0">
                        <td className="px-4 py-3 font-medium text-pine-900">{variantLabel(v) || "—"}</td>
                        <td className="px-4 py-3 text-ink/70">{v.weightKg ?? "—"}</td>
                        <td className="px-4 py-3 text-ink/70">{v.packing ?? "—"}</td>
                        <td className="px-4 py-3 text-ink/70">{v.qtyPerCarton ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {product.specs && product.specs.length > 0 && (
            <div className="mt-7">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-pine-800">
                Specifications
              </h2>
              <dl className="mt-3 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {product.specs.map((s) => (
                  <div key={s.label} className="border-b border-cream-200 pb-2 text-sm">
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink/45">
                      {s.label}
                    </dt>
                    <dd className="mt-0.5 text-ink/80">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* extra fields */}
      {(product.fabric || product.poles || product.accessories || product.bag || product.notes) && (
        <div className="card mt-12 p-6 sm:p-8">
          <h2 className="font-display text-xl font-semibold text-pine-900">Materials &amp; details</h2>
          <dl className="mt-4 grid gap-x-10 gap-y-4 text-sm sm:grid-cols-2">
            {product.fabric && (
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink/45">Fabric</dt>
                <dd className="mt-1 text-ink/80">{product.fabric}</dd>
              </div>
            )}
            {product.poles && (
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink/45">Frame / Poles</dt>
                <dd className="mt-1 text-ink/80">{product.poles}</dd>
              </div>
            )}
            {product.accessories && (
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink/45">Accessories</dt>
                <dd className="mt-1 text-ink/80">{product.accessories}</dd>
              </div>
            )}
            {product.bag && (
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink/45">Carry bag</dt>
                <dd className="mt-1 text-ink/80">{product.bag}</dd>
              </div>
            )}
            {product.notes && (
              <div className="sm:col-span-2">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink/45">Notes</dt>
                <dd className="mt-1 text-ink/80">{product.notes}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* CTA */}
      <div className="mt-12 flex flex-col items-start justify-between gap-6 rounded-2xl bg-pine-900 px-8 py-10 text-cream-50 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-2xl font-semibold">Ready to order {product.nameEn}?</h2>
          <p className="mt-2 max-w-lg text-sm text-cream-100/70">
            Tell us the quantity and destination — we&apos;ll come back with a
            wholesale quotation, lead time and shipping options.
          </p>
        </div>
        <Link href={inquiryHref} className="btn-cream shrink-0">
          Request a Quote
        </Link>
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-pine-900">
            More {category?.name.toLowerCase()}
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
