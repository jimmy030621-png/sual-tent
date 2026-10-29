import type { Metadata } from "next";
import { Suspense } from "react";
import ProductBrowser from "@/components/product-browser";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Browse the full Saul Tents catalogue — camping tents, beach tents, canopies and outdoor accessories with real factory specifications. Wholesale & OEM welcome.",
};

export default function ProductsPage() {
  return (
    <div className="container-site py-12 lg:py-16">
      <p className="eyebrow">Product centre</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-pine-900 sm:text-4xl">
        All Products
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/60 sm:text-base">
        Every listing is a real catalogue item with its factory model code and
        specification. Prices are quoted per order —{" "}
        <a href="/contact" className="font-medium text-pine-700 underline underline-offset-4">
          request a wholesale quote
        </a>
        .
      </p>

      <div className="mt-10">
        <Suspense
          fallback={
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card aspect-[4/5] animate-pulse bg-cream-100" />
              ))}
            </div>
          }
        >
          <ProductBrowser />
        </Suspense>
      </div>
    </div>
  );
}
