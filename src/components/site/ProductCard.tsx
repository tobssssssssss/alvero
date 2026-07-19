import { Link } from "@tanstack/react-router";
import type { Product } from "@/data/products";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to="/product/$id"
      params={{ id: product.id }}
      className="group block"
    >
      <div className="relative overflow-hidden bg-card aspect-[4/5] shadow-luxe">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={1200}
          height={1200}
          className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
        <div className="absolute top-4 left-4 text-[10px] tracking-[0.35em] uppercase text-gold">
          {product.category}
        </div>
      </div>
      <div className="mt-5 flex items-baseline justify-between">
        <div>
          <h3 className="font-display text-2xl leading-none">{product.name}</h3>
          <p className="mt-1 text-xs tracking-widest uppercase text-muted-foreground">
            {product.tagline}
          </p>
        </div>
        <div className="text-gold font-display text-xl">€{product.price}</div>
      </div>
    </Link>
  );
}
