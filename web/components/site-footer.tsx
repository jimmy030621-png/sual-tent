import Link from "next/link";
import { Logo } from "@/components/site-header";
import { siteConfig } from "@/config/site";
import { categories, categoryCount } from "@/lib/products";

export default function SiteFooter() {
  const { email, whatsapp } = siteConfig.contact;
  return (
    <footer className="bg-pine-950 text-cream-100">
      <div className="container-site grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo dark />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream-100/70">
            Factory-direct tents, canopies and outdoor gear for brands,
            retailers and distributors worldwide. OEM &amp; ODM welcome.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-cream-100/50">
            Products
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/products?category=${c.slug}`}
                  className="text-cream-100/85 transition-colors hover:text-cream-50"
                >
                  {c.name} <span className="text-cream-100/40">({categoryCount(c.slug)})</span>
                </Link>
              </li>
            ))}
            <li>
              <Link href="/products" className="text-cream-100/85 hover:text-cream-50">
                All Products
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-cream-100/50">
            Company
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link href="/wholesale" className="text-cream-100/85 hover:text-cream-50">
                Wholesale &amp; OEM
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-cream-100/85 hover:text-cream-50">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-cream-100/85 hover:text-cream-50">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-cream-100/50">
            Contact
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-cream-100/85">
            {email ? (
              <li>
                <a href={`mailto:${email}`} className="hover:text-cream-50">
                  {email}
                </a>
              </li>
            ) : (
              <li className="text-cream-100/50">Email — to be configured before launch</li>
            )}
            {whatsapp ? (
              <li>
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cream-50"
                >
                  WhatsApp: +{whatsapp}
                </a>
              </li>
            ) : (
              <li className="text-cream-100/50">WhatsApp — to be configured before launch</li>
            )}
            <li className="text-cream-100/50">Mon–Sat, 9:00–18:00 (GMT+8)</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream-50/10">
        <div className="container-site flex flex-col items-center justify-between gap-2 py-6 text-xs text-cream-100/45 sm:flex-row">
          <p>© 2026 {siteConfig.legalName}. All rights reserved.</p>
          <p>
            Premium outdoor gear · <Link href="/wholesale" className="hover:text-cream-100/70">Wholesale inquiries</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
