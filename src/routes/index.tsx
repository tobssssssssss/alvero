import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { products } from "@/data/products";
import { ProductCard } from "@/components/site/ProductCard";
import tk1Image from "@/assets/tk1-ai.jpg";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Alvero — Luxusná obuv & tK1 AI" },
      {
        name: "description",
        content:
          "Alvero — kolekcia luxusnej obuvi a exkluzívny prístup k tK1 AI bez limitu.",
      },
    ],
  }),
});

// ── SHOWCASE SLIDES (automatické prepínanie každých 10 s) ──────
// Sem môžeš pridať ďalšie "Access" karty (napr. ďalšie produkty, eventy…)
type Slide = {
  eyebrow: string;
  title: string;
  subtitle: string;
  image: string;
  cta: string;
  to: "/tk1" | "/shop";
  search?: { q: string; brand: string; category: string };
};

const slides: Slide[] = [
  {
    eyebrow: "Access · Nové",
    title: "tK1 — AI bez limitu",
    subtitle: "100 % offline · bez cenzúry · €20 jednorázovo",
    image: tk1Image,
    cta: "Získať tK1",
    to: "/tk1",
  },
  {
    eyebrow: "Kolekcia",
    title: "Ručne šitá obuv",
    subtitle: "Talianska koža · doživotná starostlivosť",
    image: "", // vyplní sa prvým produktom
    cta: "Preskúmať kolekciu",
    to: "/shop",
    search: { q: "", brand: "", category: "" },
  },
];

function Home() {
  const [idx, setIdx] = useState(0);
  const featured = products.filter((p) => p.featured);
  const list = featured.length > 0 ? featured : products;

  // doplň druhý slide obrázkom z prvého produktu (ak existuje)
  if (!slides[1].image && list[0]) slides[1].image = list[0].colors[0].image;

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 10_000);
    return () => clearInterval(t);
  }, []);

  const s = slides[idx];

  return (
    <div>
      {/* AUTOMATICKÝ SHOWCASE */}
      <section className="relative h-[70vh] min-h-[520px] overflow-hidden bg-card">
        {slides.map((sl, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-[1200ms] ${
              i === idx ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {sl.image && (
              <img
                src={sl.image}
                alt={sl.title}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
          </div>
        ))}

        <div className="relative z-10 mx-auto max-w-7xl h-full px-6 flex flex-col justify-end pb-20">
          <div className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4 flex items-center gap-2">
            <Sparkles className="w-3 h-3" /> {s.eyebrow}
          </div>
          <h1 className="font-display text-5xl md:text-7xl leading-[0.95] max-w-3xl">
            {s.title}
          </h1>
          <p className="mt-4 text-sm md:text-base text-muted-foreground tracking-wide">
            {s.subtitle}
          </p>
          <div className="mt-8 flex items-center gap-6">
            {s.to === "/tk1" ? (
              <Link
                to="/tk1"
                className="inline-flex items-center gap-3 bg-gold-gradient px-10 py-4 text-xs tracking-[0.35em] uppercase text-primary-foreground"
              >
                {s.cta} <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                to="/shop"
                search={s.search!}
                className="inline-flex items-center gap-3 bg-gold-gradient px-10 py-4 text-xs tracking-[0.35em] uppercase text-primary-foreground"
              >
                {s.cta} <ArrowRight className="w-4 h-4" />
              </Link>
            )}
            <div className="flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  aria-label={`Slide ${i + 1}`}
                  className={`h-[2px] transition-all ${
                    i === idx ? "w-10 bg-gold" : "w-5 bg-muted-foreground/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* KOLEKCIA */}
      <div className="mx-auto max-w-7xl px-6 pt-20 pb-24">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <div className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">Alvero</div>
            <h2 className="font-display text-4xl md:text-6xl leading-[0.95]">Kolekcia</h2>
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
      </div>
    </div>
  );
}
