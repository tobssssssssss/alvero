export function Footer() {
  return (
    <footer className="mt-32 border-t border-border/60">
      <div className="mx-auto max-w-7xl px-6 py-16 grid gap-12 md:grid-cols-3">
        <div>
          <div className="font-display text-2xl tracking-[0.25em]">ALVERO</div>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-xs">
            Ručne šitá obuv z Milána. Každý pár je jedinečné dielo, tvorené s úctou
            k remeslu a materiálu.
          </p>
        </div>
        <div>
          <div className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">Maison</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Via della Spiga 8, Miláno</li>
            <li>concierge@alvero.maison</li>
            <li>+39 02 7600 0000</li>
          </ul>
        </div>
        <div>
          <div className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">Služby</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Doživotná starostlivosť</li>
            <li>Šitie na mieru</li>
            <li>Diskrétne doručenie</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-6 text-center text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
        © {new Date().getFullYear()} Alvero Maison · Všetky práva vyhradené
      </div>
    </footer>
  );
}
