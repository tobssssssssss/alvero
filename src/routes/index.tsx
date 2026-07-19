import { createFileRoute, Link } from "@tanstack/react-router";
import { products } from "@/data/products";
import { ProductCard } from "@/components/site/ProductCard";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Alvero — Ručne šitá luxusná obuv z Milána" },
      {
        name: "description",
        content:
          "Objavte kolekciu Alvero: Oxfordky, Chelsea boots, mokasíny a sneakery šité rukou majstra.",
      },
    ],
  }),
});

function Home() {
  const featured = products.filter((p) => p.featured);

  return (
    <div>
      {/* HERO */}
      <section className="relative h-[92vh] min-h-[640px] overflow-hidden">
        <img
          src={heroImg}
          alt="Alvero luxury shoes"
          width={1920}
          height={1200}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div className="relative z-10 h-full flex flex-col justify-end pb-24 md:pb-32 px-6">
          <div className="mx-auto max-w-7xl w-full">
            <div className="text-[11px] tracking-[0.5em] uppercase text-gold mb-6">
              Kolekcia · Autunno MMXXVI
            </div>
            <h1 className="font-display text-6xl md:text-8xl lg:text-9xl leading-[0.9] max-w-4xl">
              Krok, ktorý <em className="text-gold not-italic">nezaznie</em>,
              zapamätajú si všetci.
            </h1>
            <p className="mt-8 max-w-xl text-lg text-muted-foreground leading-relaxed">
              Alvero Maison — päť generácií milánskych obuvníkov. Každý pár
              vzniká zo štyroch metrov nite, dvanástich hodín práce a jedného
              páru rúk.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/shop"
                className="bg-gold-gradient px-10 py-4 text-xs tracking-[0.35em] uppercase text-primary-foreground hover:opacity-90 transition"
              >
                Preskúmať kolekciu
              </Link>
              <Link
                to="/about"
                className="border border-gold/40 px-10 py-4 text-xs tracking-[0.35em] uppercase text-gold hover:bg-gold/10 transition"
              >
                Náš príbeh
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* HAIRLINE */}
      <div className="mx-auto max-w-7xl px-6">
        <div className="hairline my-24" />
      </div>

      {/* FEATURED */}
      <section className="mx-auto max-w-7xl px-6">
        <div className="flex items-end justify-between mb-14">
          <div>
            <div className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">
              Vybrané kúsky
            </div>
            <h2 className="font-display text-5xl md:text-6xl">Signature</h2>
          </div>
          <Link
            to="/shop"
            className="hidden md:inline text-xs tracking-[0.3em] uppercase text-muted-foreground hover:text-gold transition-colors"
          >
            Zobraziť všetky →
          </Link>
        </div>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="mx-auto max-w-4xl px-6 mt-40 text-center">
        <div className="text-[10px] tracking-[0.4em] uppercase text-gold mb-6">
          Manifest
        </div>
        <p className="font-display text-3xl md:text-5xl leading-[1.15]">
          Luxus nie je hlasný. Je to <em className="text-gold not-italic">ticho</em>,
          v ktorom počujete stopy vlastných krokov.
        </p>
      </section>

      {/* PILLARS */}
      <section className="mx-auto max-w-7xl px-6 mt-32 grid gap-12 md:grid-cols-3">
        {[
          {
            k: "01",
            t: "Talianska koža",
            d: "Vegetabilne činené kože zo Toskánska, zrejúce 45 dní.",
          },
          {
            k: "02",
            t: "Ručné šitie",
            d: "Goodyear welt konštrukcia. Opraviteľné celý život.",
          },
          {
            k: "03",
            t: "Diskrétne doručenie",
            d: "V dubovej krabici, obalené hodvábnym papierom, do 48 hodín.",
          },
        ].map((p) => (
          <div key={p.k} className="border-t border-border/60 pt-8">
            <div className="text-gold font-display text-3xl mb-4">{p.k}</div>
            <h3 className="font-display text-2xl mb-3">{p.t}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{p.d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
