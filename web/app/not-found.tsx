import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-site flex flex-col items-center py-24 text-center lg:py-32">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-pine-900 sm:text-5xl">
        This trail leads nowhere.
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-ink/60 sm:text-base">
        The page you&apos;re looking for doesn&apos;t exist — but the rest of
        the camp is right where you left it.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary">Back to Home</Link>
        <Link href="/products" className="btn-outline">Browse Products</Link>
      </div>
    </div>
  );
}
