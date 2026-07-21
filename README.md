# Alvero — Luxusný e‑shop (obuv + tK1 AI)

Kompletný návod ako **rozbehnúť projekt sám** po skopírovaní na GitHub / Netlify / Vercel + Supabase, s **funkčnými platbami cez Stripe** a **Discord botom** na pridávanie topánok príkazom `/add`.

> Všetko čo je nižšie funguje **na 100 %** ak splníš 3 kroky:
> 1. nasadíš web (Netlify/Vercel) a napojíš Supabase
> 2. uložíš všetky **secrets** (heslá/API kľúče) do env premenných
> 3. spustíš Discord bota (jeden `node bot.js` na Railway / VPS / tvojom PC)

---

## 0. Prehľad — čo kde beží

| Časť | Kde beží | Čo robí |
|---|---|---|
| Web (Alvero e‑shop, tK1) | Netlify / Vercel / Lovable | Frontend + serverless API (Stripe checkout, webhooky) |
| Databáza (produkty, objednávky) | **Supabase** | Ukladá topánky a stav platieb |
| Ukladanie obrázkov topánok | **Supabase Storage** (bucket `products`) | Bot sem uploadne fotky z Discordu |
| Platby | **Stripe** | Checkout session → success → download / order |
| Pridávanie topánok | **Discord bot** (`bot.js`) | `/add`, `/remove` — pošle do Supabase, obrázky uploadne do Storage |
| Notifikácie objednávok | **Discord webhook** | Pri kúpe (obuv aj tK1) príde embed do Discordu |

---

## 1. Deploy webu (Netlify príklad, Vercel je identický)

### 1.1 Skopíruj projekt na GitHub

```bash
git init && git add -A && git commit -m "init Alvero"
gh repo create alvero --private --source=. --push
# alebo cez github.com → New repository → push
```

### 1.2 Napoj Netlify na repo

1. netlify.com → **Add new site → Import from Git** → vyber `alvero` repo
2. **Build command:** `bun run build`  ·  **Publish directory:** `dist`
3. **Deploy** — po prvom builde dostaneš URL napr. `https://alvero.netlify.app`

### 1.3 Napoj vlastnú doménu (voliteľné)

Netlify → Site → Domain settings → Add custom domain → nastav DNS.

---

## 2. Supabase — databáza + storage

### 2.1 Vytvor projekt

1. supabase.com → **New project** (heslo si zapíš!)
2. **Project URL** a **anon / publishable key** — Settings → API
3. **service_role key** — tam istý panel, **nikomu ho neposielaj**

### 2.2 SQL — vytvor tabuľku `products`

Supabase → SQL Editor → Run:

```sql
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  brand text not null default 'Alvero',
  price numeric(10,2) not null check (price >= 0),
  description text not null default '',
  categories jsonb not null default '[]'::jsonb,
  sizes jsonb not null default '[]'::jsonb,     -- [40,41,42]
  colors jsonb not null default '[]'::jsonb,    -- [{name,hex,images:[url,...]}]
  stock integer not null default 0,
  featured boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.products to anon, authenticated;
grant all on public.products to service_role;

alter table public.products enable row level security;

create policy "public read active products"
  on public.products for select using (active = true);
```

### 2.3 Storage bucket na obrázky

Supabase → Storage → **New bucket** → meno `products` → **Private** (nie public).

Prístup budeš mať iba cez **service_role key** (bot uploaduje, web generuje **signed URL** platné napr. 1 hodinu).

---

## 3. Secrets — kam dať aké heslo

**Nikdy** ich nedávaj do kódu ani do GitHubu. Iba do env premenných hostingu.

### 3.1 Netlify / Vercel — Site settings → Environment variables

| Meno | Hodnota | Odkiaľ |
|---|---|---|
| `SUPABASE_URL` | `https://xxxxx.supabase.co` | Supabase → Settings → API |
| `SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_...` alebo `anon` key | ↑ |
| `SUPABASE_SERVICE_ROLE_KEY` | `sb_secret_...` alebo `service_role` key | ↑ |
| `STRIPE_SECRET_KEY` | `sk_live_...` (alebo `sk_test_...`) | Stripe → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Stripe → Developers → Webhooks (po vytvor. webhooku) |
| `DISCORD_ORDER_WEBHOOK` | `https://discord.com/api/webhooks/...` | Discord kanál → Edit → Integrations → Webhooks |
| `SITE_URL` | `https://alvero.sk` | tvoja produkčná doména |

### 3.2 Discord bot (bežiaci mimo webu) — `.env` na Railway / VPS

| Meno | Hodnota | Odkiaľ |
|---|---|---|
| `DISCORD_BOT_TOKEN` | `MTxxxxx.xxxxx.xxxxx` | discord.com/developers → tvoja app → Bot → Reset Token |
| `DISCORD_APPLICATION_ID` | `1234567890...` | discord.com/developers → General Information → Application ID |
| `DISCORD_GUILD_ID` | ID tvojho servera | Discord → pravý klik na server → Copy Server ID (Developer Mode zapnutý) |
| `SUPABASE_URL` | rovnaké ako web | ↑ |
| `SUPABASE_SERVICE_ROLE_KEY` | rovnaké ako web | ↑ |

---

## 4. Stripe — funkčné platby na 100 %

### 4.1 Vytvor účet a produkty

1. stripe.com → **Sign up** → vypĺň biznis údaje (fakturácia)
2. Developers → **API keys** → skopíruj `sk_live_...` (alebo `sk_test_...` pre testovanie)
3. **NIČ v Stripe dashboarde manuálne nevytváraj** — checkout session vytvorí náš kód

### 4.2 Nasaď webhook

1. Stripe → Developers → **Webhooks** → Add endpoint
2. URL: `https://TVOJA-DOMENA/api/public/stripe-webhook`
3. Events: **`checkout.session.completed`**  ·  **`payment_intent.payment_failed`**
4. Klikni na endpoint → **Signing secret** → skopíruj `whsec_...` → do env `STRIPE_WEBHOOK_SECRET`

### 4.3 Skopíruj tieto 2 súbory do projektu

**`src/lib/checkout.functions.ts`** — vytvorí Checkout Session:

```ts
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Body = z.object({
  kind: z.enum(["shoes", "tk1"]),
  items: z.array(z.object({
    name: z.string(), price: z.number().min(0), qty: z.number().int().min(1),
  })).min(1),
  platform: z.enum(["pc", "mobile"]).optional(), // len pre tK1
  email: z.string().email().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

export const createCheckout = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Body.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.STRIPE_SECRET_KEY;
    const site = process.env.SITE_URL ?? "http://localhost:3000";
    if (!key) throw new Error("STRIPE_SECRET_KEY missing");

    const params = new URLSearchParams();
    params.set("mode", "payment");
    params.set("success_url", `${site}/thank-you?session_id={CHECKOUT_SESSION_ID}`);
    params.set("cancel_url", data.kind === "tk1" ? `${site}/tk1` : `${site}/cart`);
    if (data.email) params.set("customer_email", data.email);
    params.set("metadata[kind]", data.kind);
    if (data.platform) params.set("metadata[platform]", data.platform);
    Object.entries(data.metadata ?? {}).forEach(([k, v]) =>
      params.set(`metadata[${k}]`, v),
    );

    data.items.forEach((it, i) => {
      params.set(`line_items[${i}][quantity]`, String(it.qty));
      params.set(`line_items[${i}][price_data][currency]`, "eur");
      params.set(`line_items[${i}][price_data][unit_amount]`, String(Math.round(it.price * 100)));
      params.set(`line_items[${i}][price_data][product_data][name]`, it.name);
    });

    const r = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
    if (!r.ok) throw new Error(`Stripe error: ${await r.text()}`);
    const session = await r.json() as { id: string; url: string };
    return { url: session.url, id: session.id };
  });
```

**`src/routes/api/public/stripe-webhook.ts`** — spracuje potvrdenie platby:

```ts
import { createFileRoute } from "@tanstack/react-router";

async function verifyStripeSig(payload: string, header: string, secret: string) {
  // Stripe podpis: t=timestamp,v1=hex
  const parts = Object.fromEntries(header.split(",").map(p => p.split("=")));
  const t = parts.t; const v1 = parts.v1;
  if (!t || !v1) return false;
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sigBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${t}.${payload}`));
  const hex = Array.from(new Uint8Array(sigBuf)).map(b => b.toString(16).padStart(2, "0")).join("");
  // konstant-time porovnanie
  if (hex.length !== v1.length) return false;
  let diff = 0; for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ v1.charCodeAt(i);
  return diff === 0;
}

export const Route = createFileRoute("/api/public/stripe-webhook")({
  server: { handlers: { POST: async ({ request }) => {
    const secret = process.env.STRIPE_WEBHOOK_SECRET!;
    const sig = request.headers.get("stripe-signature") ?? "";
    const raw = await request.text();
    if (!await verifyStripeSig(raw, sig, secret))
      return new Response("bad sig", { status: 401 });

    const event = JSON.parse(raw);
    if (event.type === "checkout.session.completed") {
      const s = event.data.object;
      const kind = s.metadata?.kind;
      // → sem daj notifikáciu na Discord + DB update
      await fetch(process.env.DISCORD_ORDER_WEBHOOK!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "Alvero Stripe",
          embeds: [{
            title: kind === "tk1" ? "💎 tK1 platba prijatá" : "🛍️ Objednávka zaplatená",
            color: 0xd4af37,
            fields: [
              { name: "Email", value: s.customer_details?.email ?? "-" },
              { name: "Suma", value: `€${(s.amount_total/100).toFixed(2)}` },
              ...(s.metadata?.platform ? [{ name: "Platforma", value: s.metadata.platform }] : []),
            ],
          }],
        }),
      });
    }
    return new Response("ok");
  } } },
});
```

### 4.4 Napoj tlačidlo „Objednať / Zaplatiť“

**Košík** (`src/routes/cart.tsx`) — nahraď submit:

```ts
import { createCheckout } from "@/lib/checkout.functions";
// ...
const { url } = await createCheckout({ data: {
  kind: "shoes",
  email: form.email,
  items: cart.items.map(i => ({
    name: `${i.brand} ${i.name} (${i.color}, ${i.size})`,
    price: i.price, qty: i.qty,
  })),
  metadata: {
    address: `${form.address}, ${form.zip} ${form.city}, ${form.country}`,
    phone: form.phone,
    name: form.name,
  },
}});
window.location.href = url;   // → Stripe hostovaný formulár
```

**tK1** (`src/routes/tk1.tsx`) — po výbere platformy (PC / Mobile):

```ts
const platform = pickedPc ? "pc" : "mobile";
const { url } = await createCheckout({ data: {
  kind: "tk1", platform,
  items: [{ name: `tK1 AI (${platform})`, price: 20, qty: 1 }],
}});
window.location.href = url;
```

Po platbe Stripe presmeruje na `/thank-you?session_id=...` — tam si vieš overiť session cez Stripe API a povoliť download (`DOWNLOAD_PC` / `DOWNLOAD_MOBILE`).

---

## 5. Discord bot — `/add` a `/remove`

Bot beží **mimo webu** (Railway zadarmo / VPS / tvoj PC). Pridá topánku priamo do Supabase + uploadne fotky.

### 5.1 Vytvor bota

1. discord.com/developers → **New Application** → Alvero
2. **Bot** → Reset Token → skopíruj `DISCORD_BOT_TOKEN`
3. **OAuth2 → URL Generator** → scopes: `bot` + `applications.commands` → permissions: `Send Messages`, `Use Slash Commands`, `Attach Files` → otvor URL a pozvi bota na tvoj server
4. Zapni Developer Mode v Discorde a skopíruj **Server ID** (`DISCORD_GUILD_ID`)

### 5.2 Súbor `bot.js` (skopíruj hocikam mimo web projektu)

```bash
mkdir alvero-bot && cd alvero-bot
npm init -y
npm i discord.js @supabase/supabase-js dotenv
```

Vytvor `.env`:
```
DISCORD_BOT_TOKEN=...
DISCORD_APPLICATION_ID=...
DISCORD_GUILD_ID=...
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
```

Vytvor `register-commands.js` (spusti **raz** cez `node register-commands.js`):

```js
import "dotenv/config";
import { REST, Routes, SlashCommandBuilder, ApplicationCommandOptionType } from "discord.js";

const cmds = [
  new SlashCommandBuilder()
    .setName("add")
    .setDescription("Pridaj topánku do Alvero shopu")
    .addStringOption(o => o.setName("nazov").setDescription("Napr. Obsidian").setRequired(true))
    .addNumberOption(o => o.setName("cena").setDescription("V EUR").setRequired(true))
    .addAttachmentOption(o => o.setName("foto1").setDescription("Hlavná fotka").setRequired(true))
    .addStringOption(o => o.setName("znacka").setDescription("Default Alvero"))
    .addStringOption(o => o.setName("farba").setDescription("Napr. Čierna:#111 | Biela:#eee"))
    .addStringOption(o => o.setName("velkosti").setDescription("Napr. 40,41,42,43,44"))
    .addStringOption(o => o.setName("kategorie").setDescription("Napr. Kožené,Bežné"))
    .addIntegerOption(o => o.setName("kusov").setDescription("Skladom, default 10"))
    .addStringOption(o => o.setName("popis").setDescription("Krátky popis"))
    .addAttachmentOption(o => o.setName("foto2").setDescription("Ďalšia fotka"))
    .addAttachmentOption(o => o.setName("foto3").setDescription("Ďalšia fotka"))
    .addAttachmentOption(o => o.setName("foto4").setDescription("Ďalšia fotka"))
    .toJSON(),
  new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Odober topánku (podľa mena; voliteľne aj cena/veľkosť)")
    .addStringOption(o => o.setName("nazov").setDescription("Meno topánky").setRequired(true))
    .addNumberOption(o => o.setName("cena").setDescription("Voliteľné, keď je viac s rovn. menom"))
    .addIntegerOption(o => o.setName("velkost").setDescription("Voliteľné"))
    .toJSON(),
  new SlashCommandBuilder()
    .setName("list").setDescription("Vypíš všetky topánky v shope").toJSON(),
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_BOT_TOKEN);
await rest.put(
  Routes.applicationGuildCommands(process.env.DISCORD_APPLICATION_ID, process.env.DISCORD_GUILD_ID),
  { body: cmds },
);
console.log("✅ Commands registered.");
```

Vytvor `bot.js`:

```js
import "dotenv/config";
import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import { createClient } from "@supabase/supabase-js";

const supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const slugify = s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")
  .replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");

async function uploadImage(att, slug, i) {
  const res = await fetch(att.url);
  const buf = Buffer.from(await res.arrayBuffer());
  const ext = (att.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${slug}/${Date.now()}-${i}.${ext}`;
  const { error } = await supa.storage.from("products").upload(path, buf, {
    contentType: att.contentType || `image/${ext}`, upsert: false,
  });
  if (error) throw error;
  // signed URL na 10 rokov (verejné čítanie riešime cez toto)
  const { data } = await supa.storage.from("products").createSignedUrl(path, 60*60*24*365*10);
  return data.signedUrl;
}

client.on("interactionCreate", async i => {
  if (!i.isChatInputCommand()) return;

  // ── /add ─────────────────────────────────────
  if (i.commandName === "add") {
    await i.deferReply();
    try {
      const name = i.options.getString("nazov", true);
      const price = i.options.getNumber("cena", true);
      const brand = i.options.getString("znacka") || "Alvero";
      const stock = i.options.getInteger("kusov") ?? 10;
      const description = i.options.getString("popis") || "";
      const sizes = (i.options.getString("velkosti") || "40,41,42,43,44")
        .split(",").map(x => Number(x.trim())).filter(Boolean);
      const categories = (i.options.getString("kategorie") || "")
        .split(",").map(x => x.trim()).filter(Boolean);
      const farba = (i.options.getString("farba") || "Čierna:#111111")
        .split("|").map(p => {
          const [n,h] = p.split(":").map(s=>s.trim());
          return { name: n || "Farba", hex: h || "#111111" };
        });

      const atts = ["foto1","foto2","foto3","foto4"]
        .map(k => i.options.getAttachment(k)).filter(Boolean);

      const slug = slugify(name) + "-" + Date.now().toString(36).slice(-4);
      const urls = [];
      for (let k=0; k<atts.length; k++) urls.push(await uploadImage(atts[k], slug, k));

      // všetky obrázky patria pod prvú farbu; pri viacerých farbách si ich rozdelíš neskôr
      const colors = farba.map((c, idx) => ({
        ...c, images: idx === 0 ? urls : [urls[0]],
      }));

      const { error } = await supa.from("products").insert({
        slug, name, brand, price, description,
        sizes, categories, colors, stock, active: true,
      });
      if (error) throw error;

      const emb = new EmbedBuilder()
        .setTitle(`✅ Pridané: ${brand} ${name}`)
        .setDescription(`€${price} · ${stock} ks · ${sizes.length} veľkostí`)
        .setColor(0xd4af37).setThumbnail(urls[0]);
      await i.editReply({ embeds: [emb] });
    } catch (e) {
      await i.editReply(`❌ Chyba: ${e.message}`);
    }
  }

  // ── /remove ──────────────────────────────────
  if (i.commandName === "remove") {
    await i.deferReply();
    const name = i.options.getString("nazov", true);
    const cena = i.options.getNumber("cena");
    const vel = i.options.getInteger("velkost");
    let q = supa.from("products").select("id,name,price,sizes").ilike("name", `%${name}%`);
    if (cena != null) q = q.eq("price", cena);
    const { data, error } = await q;
    if (error) return i.editReply(`❌ ${error.message}`);
    let list = data || [];
    if (vel != null) list = list.filter(p => Array.isArray(p.sizes) && p.sizes.includes(vel));
    if (list.length === 0) return i.editReply("❌ Nenájdené.");
    if (list.length > 1)
      return i.editReply(`⚠️ Viac zhod (${list.length}). Doplň cenu/veľkosť.`);
    const { error: e2 } = await supa.from("products").delete().eq("id", list[0].id);
    if (e2) return i.editReply(`❌ ${e2.message}`);
    await i.editReply(`🗑️ Odstránené: **${list[0].name}** (€${list[0].price}).`);
  }

  // ── /list ────────────────────────────────────
  if (i.commandName === "list") {
    await i.deferReply();
    const { data } = await supa.from("products").select("name,brand,price,stock").eq("active", true);
    if (!data?.length) return i.editReply("_(prázdne)_");
    await i.editReply(data.map(p => `• ${p.brand} **${p.name}** — €${p.price} · ${p.stock} ks`).join("\n"));
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
console.log("🤖 Bot beží.");
```

### 5.3 Spusti bota

```bash
node register-commands.js   # raz, na registráciu /add /remove /list
node bot.js                 # necháš bežať 24/7
```

**Zadarmo hosting bota:** Railway.app → New project → Deploy from GitHub → pridaj rovnaké `.env` premenné → start command `node bot.js`.

### 5.4 Napoj web na DB produkty (voliteľné, doplniť do webu)

V `src/lib/products.functions.ts`:

```ts
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

export const listDbProducts = createServerFn({ method: "GET" }).handler(async () => {
  const supa = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data } = await supa.from("products").select("*").eq("active", true)
    .order("created_at", { ascending: false });
  return data ?? [];
});
```

V `src/routes/shop.tsx` volaj `useQuery(["db-products"], () => listDbProducts())` a spoj s `products` z `src/data/products.ts`.

---

## 6. tK1 — platba + výber PC/Mobile

Flow: **Získať tK1 → Overenie 18+ → PC alebo Mobile → Stripe checkout → po platbe download**.

`src/routes/tk1.tsx` (kľúčové časti):

```tsx
const [platform, setPlatform] = useState<"pc"|"mobile"|null>(null);

// po overení veku:
<button onClick={() => setPlatform("pc")}>💻 Windows / macOS</button>
<button onClick={() => setPlatform("mobile")}>📱 Android / iOS</button>

// keď je platforma vybraná:
<button onClick={async () => {
  const { url } = await createCheckout({ data: {
    kind: "tk1", platform,
    items: [{ name: `tK1 AI (${platform})`, price: 20, qty: 1 }],
  }});
  window.location.href = url;
}}>Zaplatiť €20</button>
```

Po `/thank-you?session_id=...` overíš session cez Stripe API a povolíš:
```ts
const DOWNLOAD_PC = "https://tvoja-cdn/tk1-windows.exe";
const DOWNLOAD_MOBILE = "https://tvoja-cdn/tk1-android.apk";
```

Ak vek = **Nie**, ulož `localStorage.setItem("tk1_locked_until", String(Date.now()+7*864e5))` — 7 dní blok.

---

## 7. Bezpečnosť — čo je automatické, čo pridať

**Už funguje:**
- Row Level Security v Supabase → cez `anon` sa nedá zapisovať do `products`
- Stripe webhook overuje `stripe-signature` (HMAC SHA‑256, konstant‑time)
- Bot používa `service_role` iba na serveri, **nikdy** ho nedávaj do frontendu ani do GitHubu
- Root error boundary posiela chyby na Discord (`src/lib/report.functions.ts`)

**Odporúčam pridať:**
- **2FA** na Netlify, Supabase, Stripe, Discord a GitHub účte (najčastejší útok = ukradnutý účet)
- **Rate limit** na `/api/public/*` — Cloudflare pred Netlify: 60 req/min/IP
- **CSP hlavička** v `src/server.ts`: `default-src 'self'; script-src 'self' https://js.stripe.com;`
- **Kill‑switch:** env `SITE_LOCKED=1` → root layout vykreslí „Stránka je dočasne uzamknutá“
- **`bun audit`** raz mesačne alebo Dependabot v GitHube

Ak by niekto tvoju stránku zmenil → automaticky príde na Discord `🛑 Chyba` s URL a stackom. Po oprave príde `✅ Chyba opravená`.

---

## 8. Skript / štruktúra súborov

| Súbor | Účel |
|---|---|
| `src/data/products.ts` | Statický katalóg (fallback / štartovacie topánky) |
| `src/routes/index.tsx` | Domov + auto showcase (10 s) |
| `src/routes/tk1.tsx` | tK1 AI — age gate + PC/Mobile + platba |
| `src/routes/shop.tsx` | Kolekcia + hľadanie + filtre |
| `src/routes/cart.tsx` | Košík → Stripe checkout |
| `src/routes/thank-you.tsx` | Po platbe (session verify + download) |
| `src/lib/checkout.functions.ts` | **VYTVOR** — Stripe Checkout Session |
| `src/routes/api/public/stripe-webhook.ts` | **VYTVOR** — potvrdenie platby |
| `src/lib/products.functions.ts` | **VYTVOR** — čítanie z Supabase |
| `src/lib/order.functions.ts` | Discord notifikácia (funguje aj bez Stripe) |
| `bot.js` + `register-commands.js` | Discord bot (mimo repa alebo v `/bot/`) |

---

## 9. Checklist pred spustením

- [ ] Web nasadený na Netlify/Vercel, dostupný na `https://…`
- [ ] Supabase projekt vytvorený, SQL z bodu 2.2 spustené, bucket `products` (private) existuje
- [ ] V Netlify pridaných všetkých **7 env premenných** z 3.1
- [ ] Stripe webhook nastavený na `/api/public/stripe-webhook`, `whsec_...` uložený
- [ ] Discord webhook (`DISCORD_ORDER_WEBHOOK`) uložený
- [ ] Discord bot vytvorený, pozvaný na server, `.env` má 5 premenných z 3.2
- [ ] `node register-commands.js` spustené → v Discorde vidíš `/add`, `/remove`, `/list`
- [ ] `node bot.js` beží (Railway / VPS)
- [ ] Test: v Discorde `/add` s fotkou → topánka je v Supabase → objaví sa na webe
- [ ] Test: kúp v test móde (`sk_test_...`, karta `4242 4242 4242 4242`) → príde ti Discord embed

Keď je všetkých 10 odškrtnutých — funguje to **na 100 %**.
