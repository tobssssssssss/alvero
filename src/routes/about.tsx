import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({
    meta: [
      { title: "Príbeh · Alvero Maison" },
      { name: "description", content: "Päť generácií milánskych obuvníkov. Príbeh Alvero." },
    ],
  }),
});

function About() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24">
      <div className="text-[10px] tracking-[0.4em] uppercase text-gold mb-6">Maison</div>
      <h1 className="font-display text-6xl md:text-7xl leading-[0.95] mb-12">
        Päť generácií.<br />
        <em className="text-gold not-italic">Jedna posadnutosť.</em>
      </h1>

      <div className="space-y-8 text-lg text-muted-foreground leading-relaxed">
        <p>
          V roku 1908 otvoril Alvero Bertolini malú dielňu na Via della Spiga v
          Miláne. Šil topánky pre miestnych bankárov, hercov La Scaly a jedného
          kráľa v exile.
        </p>
        <p>
          Dnes, o viac ako storočie neskôr, sme stále v tej istej dielni. Stále
          používame drevené kopyta prispôsobené presne jednej nohe. Stále veríme,
          že topánka musí prežiť svojho majiteľa.
        </p>
        <p>
          Nevyrábame veľa. Vyrábame len to, čo si vieme obhájiť. A každý pár, ktorý
          opustí naše dvere, má vyryté meno majstra, ktorý ho zostrojil.
        </p>
      </div>

      <div className="hairline my-16" />

      <div className="font-display text-3xl text-center italic">
        „La scarpa deve durare più dell'uomo."
      </div>
      <div className="mt-3 text-center text-xs tracking-[0.3em] uppercase text-muted-foreground">
        — Alvero Bertolini, 1908
      </div>
    </div>
  );
}
