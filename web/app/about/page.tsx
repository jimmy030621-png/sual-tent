import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Saul Tents is a factory-direct outdoor shelter manufacturer — tents, canopies and gear built for brands and distributors worldwide, with OEM/ODM production.",
};

const VALUES = [
  {
    title: "Built to sell, not just to pitch",
    text: "Every product in our catalogue ships weekly. What you see is what your customers get.",
  },
  {
    title: "Margin-first pricing",
    text: "Factory-direct costs with no trading-company layer. Your retail margin is designed in, not squeezed out.",
  },
  {
    title: "One factory, full control",
    text: "Cutting, sewing, coating, frames and packing under one roof — so quality and lead times stay in our hands.",
  },
  {
    title: "Honest timelines",
    text: "We quote real production schedules and stand behind them with photo QC reports at every run.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-pine-950 py-20 text-cream-50 lg:py-24">
        <div className="container-site relative">
          <p className="eyebrow text-clay-300">About Saul Tents</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            A decade under canvas.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-cream-100/75 sm:text-lg">
            Saul Tents is the international wholesale arm of a seasoned outdoor
            shelter manufacturer — exporting camping tents, canopies and
            outdoor gear to 30+ markets since the early 2010s.
          </p>
        </div>
      </section>

      <section className="container-site py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="eyebrow">Our story</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-pine-900 sm:text-4xl">
              From local workshop to export factory
            </h2>
            <div className="mt-5 space-y-4 text-sm leading-relaxed text-ink/65 sm:text-base">
              <p>
                What started as a small workshop sewing tents for the domestic
                camping market has grown into a full production line: automated
                cutting tables, welded canopy frames, coating lines and an
                in-house QC team.
              </p>
              <p>
                Today our catalogue spans more than 120 products — from
                lightweight backpacking tents to 5-metre event canopies — and
                ships to retailers, rental companies and brand owners in
                Europe, North America, the Middle East, Southeast Asia and
                Australia.
              </p>
              <p>
                Most of our output is OEM/ODM: private labels, custom colours,
                upgraded coatings and re-cut sizes. If you can spec it, we can
                probably sew it.
              </p>
            </div>
          </div>

          <div className="grid content-start gap-5 sm:grid-cols-2">
            <div className="card card-hover flex flex-col items-center gap-2 p-8 text-center">
              <span className="font-display text-4xl font-semibold text-clay-500">10+</span>
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/55">
                Years in outdoor manufacturing
              </span>
            </div>
            <div className="card card-hover flex flex-col items-center gap-2 p-8 text-center">
              <span className="font-display text-4xl font-semibold text-clay-500">120+</span>
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/55">
                Active catalogue products
              </span>
            </div>
            <div className="card card-hover flex flex-col items-center gap-2 p-8 text-center">
              <span className="font-display text-4xl font-semibold text-clay-500">30+</span>
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/55">
                Export markets served
              </span>
            </div>
            <div className="card card-hover flex flex-col items-center gap-2 p-8 text-center">
              <span className="font-display text-4xl font-semibold text-clay-500">100%</span>
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/55">
                Pre-shipment QC inspection
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-cream-50 to-cream-100/70 py-16 lg:py-20">
        <div className="container-site">
          <p className="eyebrow">What we stand for</p>
          <h2 className="mt-2 max-w-2xl font-display text-3xl font-semibold tracking-tight text-pine-900 sm:text-4xl">
            The values behind every seam
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <div key={v.title} className="card card-hover p-6">
                <h3 className="text-sm font-semibold text-pine-900">{v.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-ink/55">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-site py-16 text-center lg:py-20">
        <h2 className="mx-auto max-w-2xl font-display text-3xl font-semibold tracking-tight text-pine-900 sm:text-4xl">
          Let&apos;s put your brand on a tent.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm text-ink/60 sm:text-base">
          Tell us what you&apos;re building — we&apos;ll match it to a model, a
          price tier and a production slot.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/contact" className="btn-primary">Contact Us</Link>
          <Link href="/wholesale" className="btn-outline">Wholesale Program</Link>
        </div>
      </section>
    </>
  );
}
