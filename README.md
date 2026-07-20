# Alvero — Luxusný e‑shop (obuv + tK1 AI)

Ručne šitá luxusná obuv **Alvero** + jednorazový prístup k **tK1 AI**.

---

## 1. Pridanie / úprava topánok

Otvor **`src/data/products.ts`** a použi `topankyAdd({...})`.
Príklad je priamo v súbore (zakomentovaný).

```ts
import shoeNewBlack from "@/assets/shoe-new-black.jpg";
import shoeNewBlackSide from "@/assets/shoe-new-black-side.jpg";
import shoeNewWhite from "@/assets/shoe-new-white.jpg";

topankyAdd({
  id: "moja-topanka",
  name: "Moja topánka",
  brand: "Alvero",
  price: 590,
  categories: ["Bežné", "Kožené"],
  sizes: [40, 41, 42, 43, 44],
  colors: [
    // Viacej obrázkov pre jednu farbu — v detaile sa automaticky
    // prepínajú každých 10 s a dajú sa preklikať cez malé náhľady.
    { name: "Čierna", hex: "#111", images: [shoeNewBlack, shoeNewBlackSide] },
    { name: "Biela",  hex: "#eee", images: [shoeNewWhite] },
  ],
  featured: true, // zobrazí sa aj na domovskej
});
```

Obrázky ukladaj do `src/assets/`. Názov premennej pri importe si voľ
ľubovoľne (napr. `ciernaTopanka`, `bielaTopanka`) — v poli `images: [...]`
ich potom v tomto poradí zobrazí galéria.

## 2. Automatický showcase na domovskej

Domovská má hero, ktoré sa **automaticky prepína každých 10 s**.
Sliedy pridáš v poli `slides` v súbore **`src/routes/index.tsx`**.

## 3. Karta tK1 (AI)

- Cesta: `/tk1` (súbor `src/routes/tk1.tsx`).
- Cena: `20 €` (premenná `PRICE`).
- Flow: **Získať → Overenie veku (18+) → Platba → Download PC / Mobile**.
- Ak používateľ zvolí *Nie*, prístup je uzamknutý **7 dní** (`localStorage`).
- Po platbe sa uloží `tk1_paid=1` — používateľ sa vráti a rovno vidí downloady.
- **Download linky** uprav v hornej časti súboru:
  ```ts
  const DOWNLOAD_PC = "https://.../tk1-windows.exe";
  const DOWNLOAD_MOBILE = "https://.../tk1-android.apk";
  ```

## 4. Objednávky obuvi → Discord

Pri odoslaní košíka posielame Discord embed (značka · farba · veľkosť · adresa · suma).
Kód: `src/lib/order.functions.ts`. Webhook URL je nastavená ako
env premenná **`DISCORD_ORDER_WEBHOOK`** (Lovable Cloud → Secrets).

---

## 5. Reálny platobný terminál (kde a ako pridať)

Momentálne je platba za tK1 **simulovaná** (tlačidlo „Zaplatiť“ len odomkne download).
Pre reálne kartové platby máš **dve odporúčané cesty** — v oboch prípadoch
**nikdy neuchovávaj číslo karty na svojej stránke**. Kartu vždy zadáva
zákazník do hostovaného formulára poskytovateľa (PCI‑DSS compliance).

### A) Stripe (odporúčané, najjednoduchšie)

1. V Loveable použi nástroj **Stripe payments** — vytvorí sa Checkout Session.
2. V `src/routes/tk1.tsx` nahraď funkciu `fakePay()`:
   ```ts
   const { url } = await createCheckout({ data: { product: "tk1", price: PRICE } });
   window.location.href = url;
   ```
3. Vytvor server function `createCheckout` (`src/lib/checkout.functions.ts`),
   ktorá zavolá **Stripe Checkout** so `success_url` = `/tk1?paid=1`
   a `cancel_url` = `/tk1`.
4. Vytvor webhook route **`src/routes/api/public/stripe-webhook.ts`** –
   overí `stripe-signature`, a po `checkout.session.completed`
   označí objednávku ako zaplatenú (napr. e‑mailom pošle download link).
5. Kľúče **`STRIPE_SECRET_KEY`** a **`STRIPE_WEBHOOK_SECRET`** pridaj do
   Cloud → Secrets (nikdy nie do kódu ani do `.env` v repo).

### B) GitHub Sponsors (jednorazová platba / darovanie)

Ak nechceš vlastný terminál, presmeruj tlačidlo na svoju
GitHub Sponsors stránku:
```ts
window.location.href = "https://github.com/sponsors/TVOJ_USERNAME";
```
Po prijatí sponzorstva pošli download link cez GitHub Sponsors webhook
(rovnaký princíp ako Stripe webhook, iba iný podpis).

### Kam s heslami / API kľúčmi

- **Nikdy** ich nedávaj do kódu ani do `README.md`.
- Ulož ich cez **Lovable Cloud → Secrets** (v editore je na to formulár).
- Server functions ich čítajú cez `process.env.NAZOV_KLUCA`.
- Ak používaš GitHub → v repo daj len prázdny `.env.example` s **názvami**
  premenných; skutočné hodnoty sú v Secrets.

---

## 6. Bezpečnosť — ochrana pred „hacknutím“

Statická stránka + server functions v Lovable Cloud sú štandardne dobre
izolované, ale doplnili sme aj vlastný monitoring:

### Čo je už implementované

- **Discord monitor** (`src/lib/report.functions.ts`) — každá chyba, ktorá
  spadne do root error boundary, pošle správu na Discord (`🛑 Chyba`).
  Keď stránku opravíš a načíta sa čisto, príde `✅ Chyba opravená`.
- **RLS + server-side validácia** (Zod) na každom vstupe do server function
  → nikto nemôže odoslať objednávku so zlými dátami.
- **HTTP‑only session cookies** pre budúce prihlásenie (`useSession`).
- **Timing‑safe porovnávanie** hesiel (ak pridáš admin gate).

### Čo doplniť ak chceš maximálnu ochranu

- **Rate limiting** na `/api/public/*` — max N requestov / IP / minútu
  (napr. cez Cloudflare rules).
- **Content Security Policy** hlavičku v `src/server.ts`
  (`default-src 'self'; script-src 'self'; …`).
- **Kill‑switch**: server function `killSwitch()` prečíta env `SITE_LOCKED`,
  a ak je `"1"`, root layout vykreslí „Stránka je dočasne uzamknutá“ +
  automaticky pošle notifikáciu na Discord. Zamknúť/odomknúť sa dá jedným
  prepnutím Secretu v Cloud dashboarde — nemusíš deployovať.
- **Dependabot / bun audit** na aktualizáciu závislostí.
- **2FA** na Lovable a GitHub účte — najčastejšia cesta „hacknutia“ je
  ukradnutý účet, nie sama stránka.

Nikto **nemôže** hocijako zmeniť tvoju stránku bez prístupu do
tvojho Lovable projektu alebo tvojho GitHubu — preto začni tam.

---

## 7. Skript / štruktúra súborov

| Súbor | Účel |
|---|---|
| `src/data/products.ts` | Katalóg topánok (`topankyAdd`) |
| `src/routes/index.tsx` | Domov + auto showcase (10 s) |
| `src/routes/tk1.tsx` | tK1 AI — age gate + platba + download |
| `src/routes/shop.tsx` | Kolekcia + hľadanie + filtre |
| `src/routes/cart.tsx` | Košík + doručovacie údaje |
| `src/lib/order.functions.ts` | Odoslanie objednávky na Discord |
| `src/lib/report.functions.ts` | Chybový monitor → Discord |
| `src/components/site/Header.tsx` | Navigácia (tK1 · Domov · Kolekcia) |
