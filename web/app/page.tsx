import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/product-card";
import SectionHeading from "@/components/section-heading";
import { categories, categoryCount, getFeaturedProducts } from "@/lib/products";

const HERO_IMAGES = getFeaturedProducts(3).filter((p) => p.images.length > 0);

export default function Home() {
  const featured = getFeaturedProducts(8);

  return (
    <>
      {/* ------------------------------------------------------------ hero */}
      <section className="relative overflow-hidden bg-pine-950 text-cream-50">
        {/* subtle topographic pattern */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <pattern id="topo" width="120" height="120" patternUnits="userSpaceOnUse">
              <path d="M0 60 Q 30 20 60 60 T 120 60" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <path d="M0 90 Q 30 55 60 90 T 120 90" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <path d="M0 30 Q 30 -5 60 30 T 120 30" fill="none" stroke="currentColor" strokeWidth="1.2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#topo)" />
        </svg>
        <div className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-pine-700/40 blur-3xl" />

        <div className="container-site relative grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <p className="eyebrow text-clay-300">Factory-direct outdoor shelter</p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Tents built for the wild.
              <br />
              <span className="text-cream-200/90">Priced for your margins.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-cream-100/75 sm:text-lg">
              Saul Tents designs and manufactures camping tents, canopies and
              outdoor gear for brands, retailers and distributors worldwide.
              OEM &amp; ODM — from your drawings to your door.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products" className="btn-cream">Browse Products</Link>
              <Link href="/wholesale" className="btn-outline-light">Wholesale &amp; OEM</Link>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-cream-50/15 pt-6 text-center">
              <div>
                <dt className="order-2 mt-1 text-[11px] uppercase tracking-[0.16em] text-cream-100/55">Products</dt>
                <dd className="font-display text-2xl font-semibold text-cream-50">120+</dd>
              </div>
              <div>
                <dt className="order-2 mt-1 text-[11px] uppercase tracking-[0.16em] text-cream-100/55">Years in trade</dt>
                <dd className="font-display text-2xl font-semibold text-cream-50">10+</dd>
              </div>
              <div>
                <dt className="order-2 mt-1 text-[11px] uppercase tracking-[0.16em] text-cream-100/55">Export markets</dt>
                <dd className="font-display text-2xl font-semibold text-cream-50">30+</dd>
              </div>
            </dl>
          </div>

          {HERO_IMAGES.length > 0 && (
            <div className="relative hidden lg:block">
              <div className="grid grid-cols-2 gap-5">
                {HERO_IMAGES.slice(0, 2).map((p, i) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.id}`}
                    className={`group relative overflow-hidden rounded-2xl border border-cream-50/15 ${
                      i === 1 ? "mt-10" : ""
                    }`}
                  >
                    <Image
                      src={p.images[0]}
                      alt={p.nameEn}
                      width={700}
                      height={525}
                      className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-pine-950/85 to-transparent px-4 pb-3 pt-10 text-xs font-medium text-cream-50">
                      {p.nameEn}
                    </span>
                  </Link>
                ))}
              </div>
              {HERO_IMAGES[2] && (
                <Link
                  href={`/products/${HERO_IMAGES[2].id}`}
                  className="group absolute -bottom-8 right-8 w-56 overflow-hidden rounded-2xl border border-cream-50/15 shadow-2xl shadow-pine-950"
                >
                  <Image
                    src={HERO_IMAGES[2].images[0]}
                    alt={HERO_IMAGES[2].nameEn}
                    width={700}
                    height={525}
                    className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------ categories */}
      <section className="container-site py-16 lg:py-20">
        <SectionHeading
          eyebrow="What we make"
          title="Three ranges. One standard."
          description="Every product is drawn from our live factory catalogue — real models, real specifications, ready to quote."
        />

        <div className="grid gap-5 md:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/products?category=${c.slug}`}
              className="card card-hover group relative overflow-hidden p-7"
            >
              <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-pine-100/70 transition-transform duration-500 group-hover:scale-125" />
              <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-pine-800 text-cream-50">
                {c.slug === "tents" && (
                  <svg width="22" height="22" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                    <path d="M16 4 30 26H22L16 15.5 10 26H2L16 4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                    <path d="M8 26h16v2H8v-2Z" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                )}
                {c.slug === "canopies" && (
                  <svg width="22" height="22" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                    <path d="M4 10h24l-3 4H7l-3-4ZM8 14v9M24 14v9M12 23v4M20 23v4M6 10l-2 4M26 10l2 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {c.slug === "accessories" && (
                  <svg width="22" height="22" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                    <circle cx="16" cy="16" r="11" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M16 9v14M9 16h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                )}
              </span>
              <h3 className="relative mt-5 font-display text-xl font-semibold text-pine-900">{c.name}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-ink/60">{c.tagline}</p>
              <p className="relative mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-clay-600">
                {categoryCount(c.slug)} products
                <span className="ml-1 inline-block transition-transform group-hover:translate-x-1">→</span>
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------ featured */}
      <section className="bg-gradient-to-b from-cream-50 to-cream-100/70 py-16 lg:py-20">
        <div className="container-site">
          <SectionHeading
            eyebrow="Featured"
            title="From the factory floor"
            description="A snapshot of what ships every week — camping tents, event canopies and the hardware that holds them."
            link={{ href: "/products", label: "View all products" }}
          />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------- wholesale band */}
      <section className="container-site py-16 lg:py-20">
        <div className="relative overflow-hidden rounded-3xl bg-pine-800 px-8 py-14 text-cream-50 sm:px-14">
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <pattern id="topo2" width="120" height="120" patternUnits="userSpaceOnUse">
                <path d="M0 60 Q 30 20 60 60 T 120 60" fill="none" stroke="currentColor" strokeWidth="1.2" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#topo2)" />
          </svg>
          <div className="relative grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="eyebrow text-clay-300">B2B program</p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Wholesale pricing, private labelling, custom production.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-cream-100/75 sm:text-base">
                Send us your target specs or your competitor&apos;s sample — we return
                a matched quotation within 24 hours. Low MOQs for new brands,
                full OEM/ODM for established ones.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
              <Link href="/wholesale" className="btn-cream">Wholesale Program</Link>
              <Link href="/contact" className="btn-outline-light">Request a Quote</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
