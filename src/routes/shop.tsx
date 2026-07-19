import { createFileRoute } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { Search, X } from "lucide-react";
import { products, allBrands, allCategories } from "@/data/products";
import { ProductCard } from "@/components/site/ProductCard";

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  brand: fallback(z.string(), "").default(""),
  category: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/shop")({
  validateSearch: zodValidator(searchSchema),
  component: Shop,
  head: () => ({
    meta: [
      { title: "Kolekcia · Alvero" },
      { name: "description", content: "Prehľadajte kolekciu Alvero — hľadajte podľa značky, kategórie a mena." },
    ],
  }),
});

function Shop() {
  const { q, brand, category } = Route.useSearch();
  const navigate = Route.useNavigate();
  const brands = allBrands();
  const categories = allCategories();

  const filtered = products.filter((p) => {
    if (brand && p.brand !== brand) return false;
    if (category && !p.categories.includes(category)) return false;
    if (q) {
      const s = q.toLowerCase();
      const hay = `${p.name} ${p.brand} ${p.categories.join(" ")} ${p.colors
        .map((c) => c.name)
        .join(" ")}`.toLowerCase();
      if (!hay.includes(s)) return false;
    }
    return true;
  });

  const setQ = (v: string) => navigate({ search: (s) => ({ ...s, q: v }) });
  const setBrand = (v: string) =>
    navigate({ search: (s) => ({ ...s, brand: s.brand === v ? "" : v }) });
  const setCategory = (v: string) =>
    navigate({ search: (s) => ({ ...s, category: s.category === v ? "" : v }) });

  const active = q || brand || category;

  return (
    <div className="mx-auto max-w-7xl px-6 pt-12 pb-24">
      <div className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">Kolekcia</div>
      <h1 className="font-display text-5xl md:text-6xl mb-8">Hľadať topánky</h1>

      {/* SEARCH */}
      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Hľadať podľa mena, značky alebo farby…"
          className="w-full bg-transparent border border-border pl-11 pr-4 py-3 focus:border-gold outline-none transition-colors"
        />
      </div>

      {/* BRAND FILTER */}
      {brands.length > 0 && (
        <div className="mt-8">
          <div className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-3">Značka</div>
          <div className="flex flex-wrap gap-2">
            {brands.map((b) => (
              <button
                key={b}
                onClick={() => setBrand(b)}
                className={`px-4 py-2 text-xs tracking-widest uppercase border transition-all ${
                  brand === b
                    ? "border-gold bg-gold-gradient text-primary-foreground"
                    : "border-border hover:border-gold/60"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CATEGORY FILTER */}
      {categories.length > 0 && (
        <div className="mt-6">
          <div className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-3">Kategória</div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1.5 text-[11px] tracking-widest uppercase border transition-all ${
                  category === c
                    ? "border-gold text-gold"
                    : "border-border/60 text-muted-foreground hover:border-gold/60 hover:text-gold"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {active && (
        <button
          onClick={() => navigate({ search: { q: "", brand: "", category: "" } })}
          className="mt-6 inline-flex items-center gap-2 text-[11px] tracking-widest uppercase text-muted-foreground hover:text-gold"
        >
          <X className="w-3 h-3" /> Zrušiť filtre
        </button>
      )}

      <div className="hairline my-12" />

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          Nič nenájdené — skúste iný výraz.
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
