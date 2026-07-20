// ─────────────────────────────────────────────────────────────
// ALVERO — Katalóg topánok
//
// AKO PRIDAŤ NOVÚ TOPÁNKU:
// 1) Ulož obrázok(y) do `src/assets/` (napr. `shoe-new-black.jpg`)
// 2) Importuj ich hore v tomto súbore
// 3) Zavolaj `topankyAdd({...})` s údajmi topánky
//
// Všetko ostatné (domov, kolekcia, detail, hľadanie, filtre podľa značky
// a kategórie) sa aktualizuje samo.
// ─────────────────────────────────────────────────────────────

import shoeOxford from "@/assets/shoe-oxford.jpg";
import shoeChelsea from "@/assets/shoe-chelsea.jpg";
import shoeSneaker from "@/assets/shoe-sneaker.jpg";
import shoeLoafer from "@/assets/shoe-loafer.jpg";

export type ColorVariant = {
  name: string;    // napr. "Čierna", "Koňak"
  hex: string;     // napr. "#111111" — swatch na karte
  images: string[]; // 1 alebo viac obrázkov, napr. [ciernatopanka, bielatopanka]
};

export type Product = {
  id: string;
  name: string;
  brand: string;
  tagline?: string;
  description: string;
  price: number;                 // v EUR
  categories: string[];          // ľubovoľné kategórie, napr. ["Bežné", "Kožené"]
  sizes: number[];
  colors: ColorVariant[];        // prvá farba = hlavný obrázok na karte
  featured?: boolean;
};

export const products: Product[] = [];

// Pridaj topánku do katalógu.
export function topankyAdd(p: Product) {
  products.push(p);
}

export const getProduct = (id: string) => products.find((p) => p.id === id);

// Všetky značky a kategórie, ktoré existujú v katalógu (pre filtre).
export const allBrands = () =>
  Array.from(new Set(products.map((p) => p.brand))).sort();
export const allCategories = () =>
  Array.from(new Set(products.flatMap((p) => p.categories))).sort();

// ─────────────────────────────────────────────────────────────
// TVOJE TOPÁNKY  ↓↓↓  (pridávaj sem)
// ─────────────────────────────────────────────────────────────

topankyAdd({
  id: "obsidian",
  name: "Obsidian",
  brand: "Alvero",
  tagline: "Ručne šitá elegancia",
  description:
    "Klasická kožená topánka z talianskej kože. Preverená remeselnou tradíciou — každý steh je vedený rukou majstra.",
  price: 690,
  categories: ["Spoločenské", "Klasika", "Kožené"],
  sizes: [40, 41, 42, 43, 44, 45],
  colors: [
    { name: "Obsidiánová čierna", hex: "#0b0b0d", images: [shoeOxford] },
    { name: "Koňak", hex: "#8a4a1f", images: [shoeChelsea] },
  ],
  featured: true,
});

topankyAdd({
  id: "cognac",
  name: "Cognac",
  brand: "Alvero",
  tagline: "Zamatová koža, ohnivý tón",
  description:
    "Vysoká kožená topánka v teplom koňakovom prevedení. Elastické boky pre dokonalé priľnutie, ručne leštená podošva.",
  price: 750,
  categories: ["Kotníkové", "Kožené", "Zimné"],
  sizes: [40, 41, 42, 43, 44, 45],
  colors: [
    { name: "Koňak", hex: "#8a4a1f", images: [shoeChelsea] },
    { name: "Čierna", hex: "#0b0b0d", images: [shoeOxford] },
  ],
  featured: true,
});

topankyAdd({
  id: "aurum",
  name: "Aurum",
  brand: "Alvero",
  tagline: "Minimalizmus so zlatým akcentom",
  description:
    "Nízka topánka z ivory kože s detailom 18-karátovej zlatej fólie. Diskrétny luxus pre každodenné nosenie.",
  price: 520,
  categories: ["Bežné", "Ľahké", "Letné"],
  sizes: [39, 40, 41, 42, 43, 44, 45],
  colors: [
    { name: "Ivory", hex: "#efe7d7", images: [shoeSneaker] },
    { name: "Bordeaux", hex: "#5a1520", images: [shoeLoafer] },
  ],
  featured: true,
});

topankyAdd({
  id: "bordeaux",
  name: "Bordeaux",
  brand: "Alvero",
  tagline: "Zlatá spona, hlboké víno",
  description:
    "Mokasína v odtieni Bordeaux s prepracovanou zlatou sponou. Nosí sa naboso alebo s hodvábnou ponožkou.",
  price: 640,
  categories: ["Spoločenské", "Kožené", "Letné"],
  sizes: [40, 41, 42, 43, 44],
  colors: [
    { name: "Bordeaux", hex: "#5a1520", images: [shoeLoafer] },
    { name: "Čierna", hex: "#0b0b0d", images: [shoeOxford] },
  ],
});

// ─────────────────────────────────────────────────────────────
// PRÍKLAD — odkomentuj a uprav pre novú topánku:
// ─────────────────────────────────────────────────────────────
//
// import shoeNewBlack from "@/assets/shoe-new-black.jpg";
// import shoeNewBrown from "@/assets/shoe-new-brown.jpg";
//
// topankyAdd({
//   id: "moja-nova-topanka",           // unikátny identifikátor
//   name: "Moja nová topánka",         // názov
//   brand: "Alvero",                   // značka (ukazuje sa aj vo filtri)
//   tagline: "Krátky slogan",          // voliteľné
//   description: "Dlhší popis...",
//   price: 590,                        // v EUR
//   categories: ["Bežné", "Kožené"],   // ľubovoľné (chipy vo filtri)
//   sizes: [40, 41, 42, 43, 44],
//   colors: [
//     { name: "Čierna", hex: "#111111", image: shoeNewBlack },
//     { name: "Hnedá",  hex: "#5a3820", image: shoeNewBrown },
//   ],
//   featured: true,                    // voliteľné — zobrazí sa aj na domovskej
// });
