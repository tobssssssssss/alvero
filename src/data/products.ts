// ─────────────────────────────────────────────────────────────
// ALVERO — Product catalog
//
// HOW TO ADD A NEW SHOE:
// 1. Put the image in `src/assets/` (e.g. `src/assets/shoe-derby.jpg`)
// 2. Import it below at the top of this file:
//       import shoeDerby from "@/assets/shoe-derby.jpg";
// 3. Add a new object to the `products` array with a unique `id`.
//
// Everything else (home page, shop, product page) updates automatically.
// ─────────────────────────────────────────────────────────────

import shoeOxford from "@/assets/shoe-oxford.jpg";
import shoeChelsea from "@/assets/shoe-chelsea.jpg";
import shoeSneaker from "@/assets/shoe-sneaker.jpg";
import shoeLoafer from "@/assets/shoe-loafer.jpg";

export type Product = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number;       // in EUR
  image: string;
  category: "Oxford" | "Chelsea" | "Sneaker" | "Loafer";
  sizes: number[];
  featured?: boolean;
};

export const products: Product[] = [
  {
    id: "obsidian-oxford",
    name: "Obsidian Oxford",
    tagline: "Ručne šitá elegancia",
    description:
      "Klasická čierna Oxfordka z talianskej kože. Preverená remeselnou tradíciou piatich generácií — každý steh je vedený rukou majstra.",
    price: 690,
    image: shoeOxford,
    category: "Oxford",
    sizes: [40, 41, 42, 43, 44, 45],
    featured: true,
  },
  {
    id: "cognac-chelsea",
    name: "Cognac Chelsea",
    tagline: "Zamatová koža, ohnivý tón",
    description:
      "Chelsea topánka v teplom koňakovom prevedení. Elastické boky pre dokonalé priľnutie, ručne leštená podošva.",
    price: 750,
    image: shoeChelsea,
    category: "Chelsea",
    sizes: [40, 41, 42, 43, 44, 45],
    featured: true,
  },
  {
    id: "aurum-sneaker",
    name: "Aurum Sneaker",
    tagline: "Minimalizmus so zlatým akcentom",
    description:
      "Nízky sneaker z ivory kože s detailom 18-karátovej zlatej fólie. Diskrétny luxus pre každodenné nosenie.",
    price: 520,
    image: shoeSneaker,
    category: "Sneaker",
    sizes: [39, 40, 41, 42, 43, 44, 45],
    featured: true,
  },
  {
    id: "bordeaux-loafer",
    name: "Bordeaux Loafer",
    tagline: "Zlatá spona, hlboké víno",
    description:
      "Mokasína v odtieni Bordeaux s prepracovanou zlatou sponou. Nosí sa naboso alebo s hodvábnou ponožkou.",
    price: 640,
    image: shoeLoafer,
    category: "Loafer",
    sizes: [40, 41, 42, 43, 44],
  },
];

export const getProduct = (id: string) => products.find((p) => p.id === id);
