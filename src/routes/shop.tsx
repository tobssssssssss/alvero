import { createFileRoute } from "@tanstack/react-router";
import { products } from "@/data/products";
import { ProductCard } from "@/components/site/ProductCard";

export const Route = createFileRoute("/shop")({
  component: Shop,
  head: () => ({
    meta: [
      { title: "Kolekcia · Alvero" },
      { name: "description", content: "Kompletná kolekcia Alvero — Oxfordky, Chelsea, mokasíny a sneakery." },
    ],
  }),
});

function Shop() {
  return (
    <div className="mx-auto max-w-7xl px-6 pt-16 pb-24">
      <div className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">
        Autunno MMXXVI
      </div>
      <h1 className="font-display text-6xl md:text-7xl mb-4">Kolekcia</h1>
      <p className="max-w-xl text-muted-foreground">
        Každý model je vyrobený v limitovanom počte. Keď je vypredaný, zostáva
        v archíve.
      </p>

      <div className="hairline my-16" />

      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
