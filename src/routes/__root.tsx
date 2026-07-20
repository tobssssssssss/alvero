import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { reportEvent } from "@/lib/report.functions";
import { CartProvider } from "@/lib/cart";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Toaster } from "sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl text-gold">404</h1>
        <h2 className="mt-4 font-display text-2xl">Stránka nenájdená</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Cesta, ktorú hľadáte, tu nie je.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center bg-gold-gradient px-6 py-3 text-xs tracking-[0.3em] uppercase text-primary-foreground"
          >
            Späť do Maison
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
    reportEvent({
      data: {
        kind: "error",
        message: error.message || "Unknown error",
        stack: (error.stack || "").slice(0, 3500),
        url: typeof window !== "undefined" ? window.location.href : "",
      },
    }).catch(() => {});
    // Označ, že máme oznámiť opravu pri ďalšom čistom načítaní.
    if (typeof window !== "undefined") {
      sessionStorage.setItem("alvero_had_error", "1");
    }
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl">Niečo sa pokazilo</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Skúste to prosím znova.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="bg-gold-gradient px-6 py-3 text-xs tracking-[0.3em] uppercase text-primary-foreground"
          >
            Skúsiť znova
          </button>
          <a
            href="/"
            className="border border-border px-6 py-3 text-xs tracking-[0.3em] uppercase"
          >
            Domov
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Alvero — Ručne šitá luxusná obuv z Milána" },
      {
        name: "description",
        content:
          "Alvero Maison — kolekcia ručne šitých topánok z talianskej kože. Oxfordky, Chelsea, mokasíny a sneakery pre náročných.",
      },
      { name: "author", content: "Alvero Maison" },
      { property: "og:title", content: "Alvero — Luxusná obuv" },
      {
        property: "og:description",
        content: "Ručne šitá obuv z Milána. Diskrétny luxus, doživotná starostlivosť.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="sk">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("alvero_had_error") === "1") {
      sessionStorage.removeItem("alvero_had_error");
      reportEvent({
        data: {
          kind: "recovered",
          message: "Stránka sa načítala bez chyby po predchádzajúcom páde.",
          url: window.location.href,
        },
      }).catch(() => {});
    }
    const onError = (e: ErrorEvent) => {
      reportEvent({
        data: { kind: "error", message: e.message, stack: e.error?.stack || "", url: window.location.href },
      }).catch(() => {});
    };
    window.addEventListener("error", onError);
    return () => window.removeEventListener("error", onError);
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
        </div>
        <Toaster theme="dark" position="top-center" />
      </CartProvider>
    </QueryClientProvider>
  );
}
