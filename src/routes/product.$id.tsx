import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { getProduct, products } from "@/data/products";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/product/$id")({
  component: ProductPage,
  loader: ({ params }) => {
    const product = getProduct(params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} · Alvero` },
          { name: "description", content: loaderData.product.description },
          { property: "og:title", content: `${loaderData.product.name} · Alvero` },
          { property: "og:description", content: loaderData.product.tagline },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-6 py-32 text-center">
      <h1 className="font-display text-5xl">Model nenájdený</h1>
      <Link to="/shop" className="mt-8 inline-block text-gold text-xs tracking-[0.3em] uppercase">
        ← Späť do kolekcie
      </Link>
    </div>
  ),
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { add } = useCart();
  const router = useRouter();
  const [size, setSize] = useState<number | null>(null);

  const related = products.filter((p) => p.id !== product.id).slice(0, 3);

  const handleAdd = () => {
    if (!size) {
      toast.error("Vyberte prosím veľkosť");
      return;
    }
    add({
      id: product.id,
      name: product.name,
      price: product.price,
      size,
      image: product.image,
    });
    toast.success(`${product.name} pridané do košíka`);
  };

  const handleBuy = () => {
    if (!size) {
      toast.error("Vyberte prosím veľkosť");
      return;
    }
    add({
      id: product.id,
      name: product.name,
      price: product.price,
      size,
      image: product.image,
    });
    router.navigate({ to: "/cart" });
  };

  return (
    <div className="mx-auto max-w-7xl px-6 pt-12 pb-24">
      <Link to="/shop" className="text-xs tracking-[0.3em] uppercase text-muted-foreground hover:text-gold">
        ← Kolekcia
      </Link>

      <div className="mt-10 grid gap-16 lg:grid-cols-2">
        <div className="relative aspect-[4/5] overflow-hidden bg-card shadow-luxe">
          <img
            src={product.image}
            alt={product.name}
            width={1200}
            height={1200}
            className="w-full h-full object-cover"
          />
        </div>

        <div>
          <div className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">
            {product.category}
          </div>
          <h1 className="font-display text-5xl md:text-6xl leading-none">{product.name}</h1>
          <p className="mt-3 text-lg text-muted-foreground italic">{product.tagline}</p>

          <div className="hairline my-8" />

          <p className="text-muted-foreground leading-relaxed">{product.description}</p>

          <div className="mt-10">
            <div className="text-gold font-display text-4xl">€{product.price}</div>
            <div className="text-xs text-muted-foreground mt-1">Vrátane DPH · Doprava zdarma</div>
          </div>

          <div className="mt-10">
            <div className="text-[10px] tracking-[0.4em] uppercase text-muted-foreground mb-3">
              Veľkosť (EU)
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s: number) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`w-14 h-14 border transition-all text-sm ${
                    size === s
                      ? "border-gold bg-gold-gradient text-primary-foreground"
                      : "border-border hover:border-gold/60"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleBuy}
              className="flex-1 bg-gold-gradient py-4 text-xs tracking-[0.35em] uppercase text-primary-foreground hover:opacity-90 transition"
            >
              Objednať
            </button>
            <button
              onClick={handleAdd}
              className="flex-1 border border-gold/50 py-4 text-xs tracking-[0.35em] uppercase text-gold hover:bg-gold/10 transition"
            >
              Do košíka
            </button>
          </div>

          <ul className="mt-10 space-y-2 text-xs tracking-widest uppercase text-muted-foreground">
            <li>· Talianska plnozrnná koža</li>
            <li>· Goodyear welt konštrukcia</li>
            <li>· Dodanie v dubovej krabici</li>
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-32">
          <div className="text-[10px] tracking-[0.4em] uppercase text-gold mb-6">
            Mohlo by sa vám páčiť
          </div>
          <div className="grid gap-10 md:grid-cols-3">
            {related.map((p) => (
              <Link key={p.id} to="/product/$id" params={{ id: p.id }} className="group">
                <div className="aspect-[4/5] overflow-hidden bg-card">
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    width={1200}
                    height={1200}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                </div>
                <div className="mt-4 flex justify-between items-baseline">
                  <div className="font-display text-xl">{p.name}</div>
                  <div className="text-gold text-sm">€{p.price}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
