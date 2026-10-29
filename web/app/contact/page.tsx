import type { Metadata } from "next";
import { Suspense } from "react";
import InquiryForm from "@/components/inquiry-form";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact & Quotation",
  description:
    "Contact Saul Tents for wholesale pricing, OEM/ODM projects and product inquiries. We reply within one business day.",
};

const CHANNELS = [
  {
    label: "Email",
    value: siteConfig.contact.email || "To be configured before launch",
    href: siteConfig.contact.email ? `mailto:${siteConfig.contact.email}` : undefined,
  },
  {
    label: "WhatsApp",
    value: siteConfig.contact.whatsapp
      ? `+${siteConfig.contact.whatsapp}`
      : "To be configured before launch",
    href: siteConfig.contact.whatsapp
      ? `https://wa.me/${siteConfig.contact.whatsapp}`
      : undefined,
  },
  {
    label: "Business hours",
    value: "Mon–Sat, 9:00–18:00 (GMT+8)",
  },
];

export default function ContactPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-pine-950 py-20 text-cream-50 lg:py-24">
        <div className="container-site relative">
          <p className="eyebrow text-clay-300">Contact</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Tell us what you need. We&apos;ll do the math.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-cream-100/75 sm:text-lg">
            Quotations within 24 hours on business days — product pricing,
            OEM projects, sample requests and shipping questions.
          </p>
        </div>
      </section>

      <section className="container-site py-14 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr] lg:gap-14">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-pine-900">
              Direct channels
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink/60">
              Prefer a quick message? WhatsApp is the fastest way to reach our
              export team during business hours.
            </p>

            <ul className="mt-7 space-y-4">
              {CHANNELS.map((c) => (
                <li key={c.label} className="card p-5">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/45">
                    {c.label}
                  </span>
                  <div className="mt-1 text-sm font-medium text-pine-900">
                    {c.href ? (
                      <a href={c.href} className="hover:text-clay-600 hover:underline underline-offset-4">
                        {c.value}
                      </a>
                    ) : (
                      c.value
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <div className="card mt-4 border-pine-200 bg-pine-50 p-5">
              <h3 className="text-sm font-semibold text-pine-900">What to include</h3>
              <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-ink/60">
                <li>• Product code(s) or a link to the product page</li>
                <li>• Sizes and quantities per model</li>
                <li>• Destination country &amp; preferred shipping term</li>
                <li>• Customisation needs (logo, colour, packaging)</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="mb-5 font-display text-2xl font-semibold tracking-tight text-pine-900">
              Send an inquiry
            </h2>
            <Suspense fallback={<div className="card h-64 animate-pulse" />}>
              <InquiryForm />
            </Suspense>
          </div>
        </div>
      </section>
    </>
  );
}
