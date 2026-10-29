"use client";

import Image from "next/image";
import { useState } from "react";
import { ProductPlaceholder } from "@/components/product-card";

export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return <ProductPlaceholder />;
  }

  const current = images[Math.min(active, images.length - 1)];

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-2xl border border-cream-200 bg-white">
        <Image
          key={current}
          src={current}
          alt={name}
          width={1400}
          height={1050}
          priority
          className="aspect-[4/3] w-full object-cover"
        />
      </div>

      {images.length > 1 && (
        <div className="flex flex-wrap gap-3" role="tablist" aria-label="Product photos">
          {images.map((img, i) => (
            <button
              key={img}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Photo ${i + 1}`}
              onClick={() => setActive(i)}
              className={`overflow-hidden rounded-lg border-2 transition-colors ${
                i === active ? "border-pine-700" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={img} alt="" width={140} height={105} className="h-16 w-20 object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
