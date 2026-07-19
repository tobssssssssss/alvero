import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/lib/cart";
import { placeOrder } from "@/lib/order.functions";

export const Route = createFileRoute("/cart")({
  component: CartPage,
  head: () => ({
    meta: [{ title: "Košík · Alvero" }, { name: "description", content: "Váš košík Alvero." }],
  }),
});

function CartPage() {
  const { items, setQty, remove, total, clear } = useCart();
  const submit = useServerFn(placeOrder);
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
    country: "Slovensko",
    note: "",
  });

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Váš košík je prázdny");
      return;
    }
    setSubmitting(true);
    try {
      const res = await submit({
        data: {
          customer: form,
          items: items.map(({ id, name, size, qty, price }) => ({ id, name, size, qty, price })),
        },
      });
      toast.success(`Objednávka ${res.orderId} prijatá`);
      clear();
      router.navigate({ to: "/thank-you", search: { order: res.orderId } });
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Nepodarilo sa odoslať objednávku");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <div className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">Košík</div>
        <h1 className="font-display text-5xl mb-6">Zatiaľ prázdno</h1>
        <p className="text-muted-foreground mb-10">
          Vyberte si niečo z našej kolekcie — čaká na vás.
        </p>
        <Link
          to="/shop"
          className="inline-block bg-gold-gradient px-10 py-4 text-xs tracking-[0.35em] uppercase text-primary-foreground"
        >
          Preskúmať kolekciu
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 pt-12 pb-24">
      <div className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">Objednávka</div>
      <h1 className="font-display text-5xl md:text-6xl mb-12">Váš košík</h1>

      <div className="grid gap-16 lg:grid-cols-[1.4fr_1fr]">
        {/* ITEMS + FORM */}
        <div>
          <div className="space-y-6">
            {items.map((item) => (
              <div
                key={`${item.id}-${item.size}`}
                className="flex gap-5 border-b border-border/60 pb-6"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-28 h-32 object-cover bg-card"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-display text-xl">{item.name}</div>
                      <div className="text-xs tracking-widest uppercase text-muted-foreground mt-1">
                        Veľkosť {item.size}
                      </div>
                    </div>
                    <button
                      onClick={() => remove(item.id, item.size)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Odstrániť"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="flex items-center border border-border">
                      <button
                        className="w-9 h-9 flex items-center justify-center hover:text-gold"
                        onClick={() => setQty(item.id, item.size, item.qty - 1)}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <div className="w-9 text-center text-sm">{item.qty}</div>
                      <button
                        className="w-9 h-9 flex items-center justify-center hover:text-gold"
                        onClick={() => setQty(item.id, item.size, item.qty + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-gold font-display text-lg">
                      €{(item.price * item.qty).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-16">
            <h2 className="font-display text-3xl mb-8">Doručenie</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Meno a priezvisko" required value={form.name} onChange={update("name")} />
              <Field label="E-mail" type="email" required value={form.email} onChange={update("email")} />
              <Field label="Telefón" required value={form.phone} onChange={update("phone")} />
              <Field label="Krajina" required value={form.country} onChange={update("country")} />
              <div className="sm:col-span-2">
                <Field label="Ulica a číslo" required value={form.address} onChange={update("address")} />
              </div>
              <Field label="Mesto" required value={form.city} onChange={update("city")} />
              <Field label="PSČ" required value={form.zip} onChange={update("zip")} />
              <div className="sm:col-span-2">
                <label className="block text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2">
                  Poznámka
                </label>
                <textarea
                  rows={3}
                  value={form.note}
                  onChange={update("note")}
                  className="w-full bg-transparent border border-border px-4 py-3 focus:border-gold outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-10 w-full bg-gold-gradient py-5 text-xs tracking-[0.4em] uppercase text-primary-foreground hover:opacity-90 transition disabled:opacity-50"
            >
              {submitting ? "Odosielam..." : "Dokončiť objednávku"}
            </button>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Platbu vybavíme mailom · žiadny platobný terminál
            </p>
          </form>
        </div>

        {/* SUMMARY */}
        <aside className="lg:sticky lg:top-28 h-fit border border-border/60 p-8 bg-card">
          <div className="text-[10px] tracking-[0.4em] uppercase text-gold mb-6">Súhrn</div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Medzisúčet</span>
              <span>€{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Doprava</span>
              <span className="text-gold">Zdarma</span>
            </div>
            <div className="hairline my-4" />
            <div className="flex justify-between items-baseline">
              <span className="text-xs tracking-[0.3em] uppercase">Spolu</span>
              <span className="font-display text-3xl text-gold">€{total.toFixed(2)}</span>
            </div>
          </div>
          <p className="mt-8 text-xs text-muted-foreground leading-relaxed">
            Vaša objednávka bude doručená v podpisovej dubovej krabici do 48 hodín od potvrdenia.
          </p>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div>
      <label className="block text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2">
        {label}
      </label>
      <input
        {...props}
        className="w-full bg-transparent border border-border px-4 py-3 focus:border-gold outline-none transition-colors"
      />
    </div>
  );
}
