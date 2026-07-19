import { Link } from "@tanstack/react-router";
import { Search, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";

export function Header() {
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 h-20 flex items-center justify-between">
        <Link to="/" className="group flex items-baseline gap-2">
          <span className="font-display text-3xl tracking-[0.25em] text-foreground">
            ALVERO
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-10 text-xs tracking-[0.3em] uppercase text-muted-foreground">
          <Link to="/" className="hover:text-gold transition-colors">Domov</Link>
          <Link to="/shop" className="hover:text-gold transition-colors">Kolekcia</Link>
          <Link
            to="/shop"
            search={{ q: "", brand: "", category: "" }}
            className="hover:text-gold transition-colors flex items-center gap-2"
          >
            <Search className="w-3.5 h-3.5" strokeWidth={1.5} /> Hľadať
          </Link>
        </nav>

        <Link
          to="/cart"
          className="relative flex items-center gap-2 text-xs tracking-[0.25em] uppercase text-foreground hover:text-gold transition-colors"
        >
          <ShoppingBag className="w-5 h-5" strokeWidth={1.25} />
          <span className="hidden sm:inline">Košík</span>
          {count > 0 && (
            <span className="absolute -top-2 -right-3 min-w-[20px] h-5 px-1 rounded-full bg-gold-gradient text-primary-foreground text-[10px] font-semibold flex items-center justify-center">
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
