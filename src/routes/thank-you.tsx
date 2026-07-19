import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/thank-you")({
  component: ThankYou,
  validateSearch: z.object({ order: z.string().optional() }),
  head: () => ({
    meta: [{ title: "Ďakujeme · Alvero" }],
  }),
});

function ThankYou() {
  const { order } = Route.useSearch();
  return (
    <div className="mx-auto max-w-2xl px-6 py-32 text-center">
      <div className="text-[10px] tracking-[0.4em] uppercase text-gold mb-6">
        Objednávka prijatá
      </div>
      <h1 className="font-display text-5xl md:text-6xl mb-6">Ďakujeme.</h1>
      <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto">
        Vaša objednávka <span className="text-gold">{order ?? "—"}</span> bola
        prijatá. Ozveme sa vám e-mailom s potvrdením a inštrukciami k platbe.
      </p>
      <div className="hairline my-12" />
      <Link
        to="/shop"
        className="inline-block bg-gold-gradient px-10 py-4 text-xs tracking-[0.35em] uppercase text-primary-foreground"
      >
        Pokračovať v prehliadaní
      </Link>
    </div>
  );
}
