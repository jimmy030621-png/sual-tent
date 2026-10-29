import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Wholesale & OEM",
  description:
    "Wholesale tents and canopies with factory-direct pricing, low MOQ, OEM/ODM customisation and private labelling. Request a quotation from Saul Tents.",
};

const PROGRAM = [
  {
    title: "Wholesale & Distribution",
    text: "Mixed-container ordering across the full catalogue. Tiered pricing by volume, with samples available before you commit.",
  },
  {
    title: "OEM / ODM",
    text: "Your logo, your colours, your fabric spec — we build to your drawings or reverse-engineer from a sample. Private labelling and packaging included.",
  },
  {
    title: "Custom Sizing",
    text: "Most of our tents and canopies can be re-cut to custom dimensions, upgraded coatings (silver, blackout, PU) and reinforced frames.",
  },
  {
    title: "Quality Control",
    text: "Every order is inspected before packing — stitch checks, coating thickness, frame fit — with photo reports available per production run.",
  },
];

const STEPS = [
  { n: "01", title: "Send your inquiry", text: "Product codes, quantities, target market. A sample or competitor link helps us match the spec." },
  { n: "02", title: "Quotation in 24h", text: "Unit price by quantity tier, lead time, carton and container details — all in one sheet." },
  { n: "03", title: "Sample & sign-off", text: "Pre-production sample shipped for approval. For OEM projects we iterate until it's right." },
  { n: "04", title: "Production & QC", text: "Bulk production with in-line checks, photo QC reports, then packing to your spec." },
  { n: "05", title: "Shipping & after-sales", text: "FOB/CIF/EXW — we handle export documents. Replacement parts and reorders always available." },
];

const FAQ = [
  {
    q: "What is your MOQ?",
    a: "Typically 50–100 pieces per model for standard items, and 300+ for full OEM projects. Mixed models in one container are welcome — ask us for the current tier sheet.",
  },
  {
    q: "Can you print our logo?",
    a: "Yes. Logo printing on fabric, embroidery on carry bags, custom hangtags and private-label packaging are all standard OEM services.",
  },
  {
    q: "How long is the lead time?",
    a: "In-stock standard items ship within 7–15 days. Custom production typically takes 25–40 days depending on the order size and season.",
  },
  {
    q: "Do you provide samples?",
    a: "Yes, at wholesale sample pricing. Sample fees are often credited against your first bulk order.",
  },
  {
    q: "Which markets do you serve?",
    a: "We export to Europe, North America, Southeast Asia, the Middle East and Australia. Certifications such as REACH / California Prop 65 test reports can be provided for fabrics on request.",
  },
];

export default function WholesalePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-pine-950 py-20 text-cream-50 lg:py-24">
        <div className="container-site relative">
          <p className="eyebrow text-clay-300">Wholesale &amp; OEM</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Your brand, our factory floor.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-cream-100/75 sm:text-lg">
            From first sample to full containers — we manufacture and ship
            outdoor shelters for retail brands, event companies, and
            distributors in 30+ markets.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact" className="btn-cream">Request a Quote</Link>
            <Link href="/products" className="btn-outline-light">Browse Catalogue</Link>
          </div>
        </div>
      </section>

      <section className="container-site py-16 lg:py-20">
        <div className="grid gap-5 md:grid-cols-2">
          {PROGRAM.map((item) => (
            <div key={item.title} className="card card-hover p-7">
              <h2 className="font-display text-lg font-semibold text-pine-900">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-b from-cream-50 to-cream-100/70 py-16 lg:py-20">
        <div className="container-site">
          <p className="eyebrow">How it works</p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-pine-900 sm:text-4xl">
            From inquiry to delivery
          </h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3 lg:grid-cols-5">
            {STEPS.map((s) => (
              <li key={s.n} className="card card-hover p-6">
                <span className="font-display text-3xl font-semibold text-clay-300">{s.n}</span>
                <h3 className="mt-3 text-sm font-semibold text-pine-900">{s.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-ink/55">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-site py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="eyebrow">FAQ</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-pine-900 sm:text-4xl">
              Asked by nearly every buyer
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ink/60">
              Something else on your mind?{" "}
              <Link href="/contact" className="font-medium text-pine-700 underline underline-offset-4">
                Send us a message
              </Link>{" "}
              — we reply within one business day.
            </p>
          </div>
          <div className="divide-y divide-cream-200">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-pine-900 sm:text-base">
                  {f.q}
                  <span className="text-clay-500 transition-transform group-open:rotate-45">＋</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-ink/60">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
