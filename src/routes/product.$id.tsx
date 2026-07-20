import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getProduct, products, type ColorVariant } from "@/data/products";
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
          { title: `${loaderData.product.brand} ${loaderData.product.name} · Alvero` },
          { name: "description", content: loaderData.product.description },
          { property: "og:title", content: `${loaderData.product.name} · Alvero` },
          { property: "og:description", content: loaderData.product.tagline ?? loaderData.product.description },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-6 py-32 text-center">
      <h1 className="font-display text-5xl">Model nenájdený</h1>
      <Link to="/shop" search={{ q: "", brand: "", category: "" }} className="mt-8 inline-block text-gold text-xs tracking-[0.3em] uppercase">
        ← Späť do kolekcie
      </Link>
    </div>
  ),
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { add } = useCart();
  const router = useRouter();
  const [colorIdx, setColorIdx] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);
  const [size, setSize] = useState<number | null>(null);
  const color = product.colors[colorIdx];
  const images = color.images;
  const currentImg = images[imgIdx] ?? images[0];

  // reset image index keď zmením farbu
  useEffect(() => {
    setImgIdx(0);
  }, [colorIdx]);

  // auto-prepínanie obrázkov každých 10 s (iba ak je ich viac)
  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => {
      setImgIdx((i) => (i + 1) % images.length);
    }, 10_000);
    return () => clearInterval(t);
  }, [images.length, colorIdx]);

  const related = products.filter((p) => p.id !== product.id).slice(0, 3);

  const buildItem = () => ({
    id: product.id,
    name: product.name,
    brand: product.brand,
    color: color.name,
    price: product.price,
    size: size!,
    image: currentImg,
  });

  const handleAdd = () => {
    if (!size) return toast.error("Vyberte prosím veľkosť");
    add(buildItem());
    toast.success(`${product.name} (${color.name}) pridané do košíka`);
  };

  const handleBuy = () => {
    if (!size) return toast.error("Vyberte prosím veľkosť");
    add(buildItem());
    router.navigate({ to: "/cart" });
  };

  return (
    <div className="mx-auto max-w-7xl px-6 pt-12 pb-24">
      <Link to="/shop" search={{ q: "", brand: "", category: "" }} className="text-xs tracking-[0.3em] uppercase text-muted-foreground hover:text-gold">
        ← Kolekcia
      </Link>

      <div className="mt-10 grid gap-16 lg:grid-cols-2">
        <div>
          <div className="relative aspect-[4/5] overflow-hidden bg-card shadow-luxe">
            {images.map((src, i) => (
              <img
                key={src + i}
                src={src}
                alt={`${product.name} ${color.name} ${i + 1}`}
                width={1200}
                height={1200}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                  i === imgIdx ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                {images.map((_, i) => (
                  <span
                    key={i}
                    className={`h-[2px] transition-all ${
                      i === imgIdx ? "w-8 bg-gold" : "w-4 bg-white/40"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="mt-4 grid grid-cols-5 gap-2">
              {images.map((src, i) => (
                <button
                  key={src + i}
                  onClick={() => setImgIdx(i)}
                  className={`aspect-square overflow-hidden border-2 transition ${
                    i === imgIdx ? "border-gold" : "border-transparent hover:border-gold/50"
                  }`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">
            {product.brand}
          </div>
          <h1 className="font-display text-5xl md:text-6xl leading-none">{product.name}</h1>
          {product.tagline && (
            <p className="mt-3 text-lg text-muted-foreground italic">{product.tagline}</p>
          )}

          <div className="hairline my-8" />

          <p className="text-muted-foreground leading-relaxed">{product.description}</p>

          <div className="mt-8">
            <div className="text-gold font-display text-4xl">€{product.price}</div>
            <div className="text-xs text-muted-foreground mt-1">Vrátane DPH · Doprava zdarma</div>
          </div>

          {/* COLOR PICKER */}
          <div className="mt-10">
            <div className="text-[10px] tracking-[0.4em] uppercase text-muted-foreground mb-3">
              Farba: <span className="text-foreground">{color.name}</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {product.colors.map((c: ColorVariant, i: number) => (
                <button
                  key={c.name}
                  onClick={() => setColorIdx(i)}
                  title={c.name}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    colorIdx === i ? "border-gold scale-110" : "border-border hover:border-gold/60"
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          {/* SIZE PICKER */}
          <div className="mt-8">
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

          {product.categories.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {product.categories.map((c: string) => (
                <span key={c} className="px-3 py-1 text-[10px] tracking-widest uppercase border border-border/60 text-muted-foreground">
                  {c}
                </span>
              ))}
            </div>
          )}

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
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-32">
          <div className="text-[10px] tracking-[0.4em] uppercase text-gold mb-6">
            Mohlo by sa vám páčiť
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {related.map((p) => (
              <Link key={p.id} to="/product/$id" params={{ id: p.id }} className="group">
                <div className="aspect-[4/5] overflow-hidden bg-card">
                  <img
                    src={p.colors[0].image}
                    alt={p.name}
                    loading="lazy"
                    width={1200}
                    height={1200}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                </div>
                <div className="mt-4 flex justify-between items-baseline">
                  <div>
                    <div className="text-[10px] tracking-[0.3em] uppercase text-gold">{p.brand}</div>
                    <div className="font-display text-xl">{p.name}</div>
                  </div>
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
