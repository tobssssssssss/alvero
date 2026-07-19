import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CartItem = {
  id: string;
  name: string;
  brand: string;
  color: string;
  price: number;
  size: number;
  image: string;
  qty: number;
};

type CartCtx = {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">) => void;
  remove: (id: string, size: number, color: string) => void;
  setQty: (id: string, size: number, color: string, qty: number) => void;
  clear: () => void;
  count: number;
  total: number;
};

const Ctx = createContext<CartCtx | null>(null);
const STORAGE = "alvero_cart_v2";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE, JSON.stringify(items));
  }, [items, hydrated]);

  const same = (a: CartItem, id: string, size: number, color: string) =>
    a.id === id && a.size === size && a.color === color;

  const add: CartCtx["add"] = (item) => {
    setItems((cur) => {
      const idx = cur.findIndex((c) => same(c, item.id, item.size, item.color));
      if (idx >= 0) {
        const copy = [...cur];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
        return copy;
      }
      return [...cur, { ...item, qty: 1 }];
    });
  };

  const remove: CartCtx["remove"] = (id, size, color) =>
    setItems((cur) => cur.filter((c) => !same(c, id, size, color)));

  const setQty: CartCtx["setQty"] = (id, size, color, qty) =>
    setItems((cur) =>
      cur
        .map((c) => (same(c, id, size, color) ? { ...c, qty: Math.max(1, qty) } : c))
        .filter((c) => c.qty > 0),
    );

  const clear = () => setItems([]);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.qty * i.price, 0);

  return (
    <Ctx.Provider value={{ items, add, remove, setQty, clear, count, total }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
