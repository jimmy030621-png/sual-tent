import Link from "next/link";

interface Props {
  eyebrow: string;
  title: string;
  description?: string;
  link?: { href: string; label: string };
  light?: boolean;
}

export default function SectionHeading({ eyebrow, title, description, link, light }: Props) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <p className="eyebrow">{eyebrow}</p>
        <h2
          className={`mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl ${
            light ? "text-cream-50" : "text-pine-900"
          }`}
        >
          {title}
        </h2>
        {description && (
          <p className={`mt-3 text-sm leading-relaxed sm:text-base ${light ? "text-cream-100/70" : "text-ink/60"}`}>
            {description}
          </p>
        )}
      </div>
      {link && (
        <Link href={link.href} className={light ? "btn-outline-light" : "btn-outline"}>
          {link.label}
        </Link>
      )}
    </div>
  );
}
