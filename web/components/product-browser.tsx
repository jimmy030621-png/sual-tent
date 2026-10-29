"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import ProductCard from "@/components/product-card";
import { allProducts, categories } from "@/lib/products";

type SortKey = "default" | "name";

export default function ProductBrowser() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") ?? "all";
  const validInitial = categories.some((c) => c.slug === initialCategory)
    ? initialCategory
    : "all";

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(validInitial);
  const [sort, setSort] = useState<SortKey>("default");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = allProducts.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (!q) return true;
      const haystack = [
        p.nameEn,
        p.nameZh,
        p.coating ?? "",
        p.fabric ?? "",
        ...p.variants.flatMap((v) => [v.size ?? "", v.fabric ?? ""]),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
    if (sort === "name") {
      list = [...list].sort((a, b) => a.nameEn.localeCompare(b.nameEn));
    }
    return list;
  }, [query, category, sort]);

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search model, size, fabric…"
            className="input pl-10"
            aria-label="Search products"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Category filter">
            {[{ slug: "all", name: "All" }, ...categories].map((c) => (
              <button
                key={c.slug}
                type="button"
                role="tab"
                aria-selected={category === c.slug}
                onClick={() => setCategory(c.slug)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  category === c.slug
                    ? "bg-pine-800 text-cream-50"
                    : "border border-pine-800/20 text-pine-800 hover:border-pine-800"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="input w-auto py-1.5 text-xs font-medium"
            aria-label="Sort products"
          >
            <option value="default">Sort: Featured</option>
            <option value="name">Sort: Name A–Z</option>
          </select>
        </div>
      </div>

      <p className="mt-6 text-sm text-ink/55" role="status">
        Showing {results.length} of {allProducts.length} products
      </p>

      {results.length === 0 ? (
        <div className="card mt-4 flex flex-col items-center gap-3 px-6 py-16 text-center">
          <p className="font-display text-lg font-semibold text-pine-900">No products match your search.</p>
          <p className="max-w-sm text-sm text-ink/55">
            Try a different keyword, or contact us — most of our range can be
            custom-made even when it&apos;s not listed.
          </p>
          <button
            type="button"
            className="btn-outline mt-2"
            onClick={() => {
              setQuery("");
              setCategory("all");
            }}
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
