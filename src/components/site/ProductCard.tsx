import { Link } from "@tanstack/react-router";
import type { Product } from "@/data/products";

export function ProductCard({ product }: { product: Product }) {
  const hero = product.colors[0];
  return (
    <Link
      to="/product/$id"
      params={{ id: product.id }}
      className="group block"
    >
      <div className="relative overflow-hidden bg-card aspect-[4/5] shadow-luxe">
        <img
          src={hero.images[0]}
          alt={`${product.brand} ${product.name}`}
          loading="lazy"
          width={1200}
          height={1200}
          className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />

        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <span className="text-[10px] tracking-[0.35em] uppercase text-gold">
            {product.brand}
          </span>
          <span className="bg-background/70 backdrop-blur px-3 py-1 text-[11px] font-display text-gold">
            €{product.price}
          </span>
        </div>

        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <div>
            <h3 className="font-display text-2xl leading-none text-foreground drop-shadow">
              {product.name}
            </h3>
            {product.tagline && (
              <p className="mt-1 text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
                {product.tagline}
              </p>
            )}
          </div>
          <div className="flex gap-1.5">
            {product.colors.slice(0, 4).map((c) => (
              <span
                key={c.name}
                title={c.name}
                className="w-4 h-4 rounded-full border border-white/30 shadow"
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
