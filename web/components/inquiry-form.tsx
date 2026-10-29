"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { trackConversion } from "@/components/analytics";
import { siteConfig } from "@/config/site";
import { allProducts, getProduct } from "@/lib/products";

type Status = "idle" | "sending" | "success" | "error";

const initialData = {
  name: "",
  company: "",
  email: "",
  phone: "",
  country: "",
  productId: "",
  quantity: "",
  message: "",
  consent: false,
};

export default function InquiryForm() {
  const searchParams = useSearchParams();
  const preselected = searchParams.get("product") ?? "";

  const [data, setData] = useState({ ...initialData, productId: preselected });
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const set = (key: keyof typeof initialData) => (value: string | boolean) => {
    setData((d) => ({ ...d, [key]: value }));
  };

  const errors: Partial<Record<keyof typeof initialData, string>> = {};
  if (!data.name.trim()) errors.name = "Please enter your name.";
  if (!data.email.trim()) errors.email = "Please enter your email.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()))
    errors.email = "That email address doesn't look right.";
  if (!data.consent) errors.consent = "Please accept so we can contact you.";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ name: true, email: true, consent: true });
    if (Object.keys(errors).length > 0) return;

    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          productId: data.productId || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Submission failed");
      trackConversion("inquiry_submit");
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="card border-pine-300 bg-pine-50 p-8 text-center" role="status">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-pine-800 text-cream-50">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12.5 9.5 18 20 6.5" />
          </svg>
        </div>
        <h3 className="mt-4 font-display text-xl font-semibold text-pine-900">
          Thank you — your inquiry has been received.
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink/60">
          We&apos;ll get back to you within one business day with a quotation.
        </p>
        {siteConfig.demoMode && (
          <p className="mx-auto mt-4 max-w-md rounded-lg bg-clay-100 px-4 py-2.5 text-xs leading-relaxed text-clay-700">
            <strong>Demo mode:</strong> this inquiry was saved to a local file
            for testing only — no real email was sent.
          </p>
        )}
        <button
          type="button"
          className="btn-outline mt-6"
          onClick={() => {
            setData({ ...initialData });
            setStatus("idle");
            setTouched({});
          }}
        >
          Send another inquiry
        </button>
      </div>
    );
  }

  const product = data.productId ? getProduct(data.productId) : undefined;

  return (
    <form onSubmit={onSubmit} noValidate className="card p-6 sm:p-8">
      {siteConfig.demoMode && (
        <p className="mb-6 rounded-lg bg-clay-100 px-4 py-2.5 text-xs leading-relaxed text-clay-700">
          <strong>Demo mode:</strong> submissions are saved to a local file for
          preview purposes only. Configure the email service in{" "}
          <code className="font-mono">config/site.ts</code> before launch.
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="label">Name *</label>
          <input
            id="name"
            type="text"
            className="input"
            value={data.name}
            onChange={(e) => set("name")(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            aria-invalid={touched.name && !!errors.name}
          />
          {touched.name && errors.name && <p className="mt-1.5 text-xs text-red-700">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="company" className="label">Company</label>
          <input
            id="company"
            type="text"
            className="input"
            value={data.company}
            onChange={(e) => set("company")(e.target.value)}
            placeholder="Your brand / shop name"
          />
        </div>

        <div>
          <label htmlFor="email" className="label">Email *</label>
          <input
            id="email"
            type="email"
            className="input"
            value={data.email}
            onChange={(e) => set("email")(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            aria-invalid={touched.email && !!errors.email}
          />
          {touched.email && errors.email && <p className="mt-1.5 text-xs text-red-700">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="label">Phone / WhatsApp</label>
          <input
            id="phone"
            type="tel"
            className="input"
            value={data.phone}
            onChange={(e) => set("phone")(e.target.value)}
            placeholder="+1 555 000 0000"
          />
        </div>

        <div>
          <label htmlFor="country" className="label">Country</label>
          <input
            id="country"
            type="text"
            className="input"
            value={data.country}
            onChange={(e) => set("country")(e.target.value)}
            placeholder="Where we'd ship to"
          />
        </div>

        <div>
          <label htmlFor="productId" className="label">Product of interest</label>
          <select
            id="productId"
            className="input"
            value={data.productId}
            onChange={(e) => set("productId")(e.target.value)}
          >
            <option value="">General inquiry</option>
            {allProducts.map((p) => (
              <option key={p.id} value={p.id}>{p.nameEn}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="quantity" className="label">Estimated quantity</label>
          <input
            id="quantity"
            type="text"
            className="input"
            value={data.quantity}
            onChange={(e) => set("quantity")(e.target.value)}
            placeholder="e.g. 200 pcs, 1×20ft container"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="message" className="label">Message</label>
          <textarea
            id="message"
            rows={5}
            className="input resize-y"
            value={data.message}
            onChange={(e) => set("message")(e.target.value)}
            placeholder={
              product
                ? `Tell us the sizes and quantities you need for ${product.nameEn}, plus any customisation (logo, colour, coating).`
                : "Tell us what you're looking for — models, sizes, quantities, customisation, target market…"
            }
          />
        </div>
      </div>

      <div className="mt-6">
        <label className="flex items-start gap-3 text-sm text-ink/70">
          <input
            type="checkbox"
            checked={data.consent}
            onChange={(e) => set("consent")(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-cream-300 accent-pine-700"
          />
          <span>
            I agree to be contacted about my inquiry.{" "}
            <span className="text-ink/45">(We only use your details to reply to this request.)</span>
          </span>
        </label>
        {touched.consent && errors.consent && <p className="mt-1.5 text-xs text-red-700">{errors.consent}</p>}
      </div>

      {status === "error" && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-xs text-red-700" role="alert">
          {error}
        </p>
      )}

      <button type="submit" disabled={status === "sending"} className="btn-primary mt-6 w-full sm:w-auto disabled:opacity-60">
        {status === "sending" ? "Sending…" : "Send Inquiry"}
      </button>
    </form>
  );
}
