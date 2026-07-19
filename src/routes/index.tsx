import { createFileRoute, Link } from "@tanstack/react-router";
import { products } from "@/data/products";
import { ProductCard } from "@/components/site/ProductCard";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Alvero — Luxusná obuv" },
      {
        name: "description",
        content: "Alvero — kolekcia luxusnej obuvi. Vyberte si podľa značky, farby a veľkosti.",
      },
    ],
  }),
});

function Home() {
  const featured = products.filter((p) => p.featured);
  const list = featured.length > 0 ? featured : products;

  return (
    <div className="mx-auto max-w-7xl px-6 pt-14 pb-24">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
        <div>
          <div className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">
            Alvero
          </div>
          <h1 className="font-display text-5xl md:text-7xl leading-[0.95]">
            Kolekcia
          </h1>
        </div>
        <Link
          to="/shop"
          search={{ q: "", brand: "", category: "" }}
          className="text-xs tracking-[0.3em] uppercase text-muted-foreground hover:text-gold transition-colors"
        >
          Hľadať a filtrovať →
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {featured.length > 0 && products.length > featured.length && (
        <div className="mt-16 text-center">
          <Link
            to="/shop"
            search={{ q: "", brand: "", category: "" }}
            className="inline-block border border-gold/50 px-10 py-4 text-xs tracking-[0.35em] uppercase text-gold hover:bg-gold/10 transition"
          >
            Zobraziť všetky
          </Link>
        </div>
      )}
    </div>
  );
}
