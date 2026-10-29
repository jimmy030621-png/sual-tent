import Image from "next/image";
import Link from "next/link";
import { getCategory, productSizeHint, type Product } from "@/lib/products";

export function ProductPlaceholder() {
  return (
    <div className="flex aspect-[4/3] w-full items-center justify-center bg-gradient-to-br from-pine-100 via-cream-100 to-pine-200">
      <div className="flex flex-col items-center gap-2 text-pine-500">
        <svg width="44" height="44" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <path d="M16 4 30 26H22L16 15.5 10 26H2L16 4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M8 26h16v2H8v-2Z" stroke="currentColor" strokeWidth="1.6" />
        </svg>
        <span className="text-xs font-medium uppercase tracking-[0.18em]">Photo on request</span>
      </div>
    </div>
  );
}

export default function ProductCard({ product }: { product: Product }) {
  const category = getCategory(product.category);
  const image = product.images[0];

  return (
    <Link
      href={`/products/${product.id}`}
      className="card card-hover group flex flex-col overflow-hidden"
    >
      <div className="relative overflow-hidden bg-cream-100">
        {image ? (
          <Image
            src={image}
            alt={product.nameEn}
            width={700}
            height={525}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <ProductPlaceholder />
        )}
        {category && (
          <span className="absolute left-3 top-3 rounded-full bg-pine-950/75 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-cream-50 backdrop-blur">
            {category.name}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="font-display text-base font-semibold leading-snug text-pine-900 transition-colors group-hover:text-clay-600">
          {product.nameEn}
        </h3>
        <p className="text-xs text-ink/55">
          {productSizeHint(product) || (product.coating ? `${product.coating} coating` : "Custom sizes available")}
        </p>
        <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-pine-700">
          View details
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
