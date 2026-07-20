import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Download, ShieldCheck, WifiOff, Infinity as InfinityIcon, Lock } from "lucide-react";
import tk1Image from "@/assets/tk1-ai.jpg";

export const Route = createFileRoute("/tk1")({
  component: Tk1Page,
  head: () => ({
    meta: [
      { title: "tK1 — AI bez limitu · Alvero" },
      { name: "description", content: "tK1 — AI bez limitu, 100% offline, bez cenzúry. 20 €." },
    ],
  }),
});

// ── KONFIGURÁCIA tK1 ────────────────────────────────────────────
// Sem daj svoje download linky:
const DOWNLOAD_PC = "https://example.com/tk1-windows.exe";
const DOWNLOAD_MOBILE = "https://example.com/tk1-android.apk";
const PRICE = 20;
const AGE_BLOCK_KEY = "tk1_age_block_until";
const PAID_KEY = "tk1_paid";
// ────────────────────────────────────────────────────────────────

type Step = "intro" | "age" | "blocked" | "pay" | "download";

function Tk1Page() {
  const [step, setStep] = useState<Step>("intro");
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    const b = Number(localStorage.getItem(AGE_BLOCK_KEY) || 0);
    if (b && b > Date.now()) {
      setBlockedUntil(b);
      setStep("blocked");
    }
    if (localStorage.getItem(PAID_KEY) === "1") {
      setPaid(true);
      setStep("download");
    }
  }, []);

  const startFlow = () => setStep("age");

  const answerAge = (adult: boolean) => {
    if (!adult) {
      const until = Date.now() + 7 * 24 * 60 * 60 * 1000;
      localStorage.setItem(AGE_BLOCK_KEY, String(until));
      setBlockedUntil(until);
      setStep("blocked");
      return;
    }
    setStep("pay");
  };

  const fakePay = () => {
    // ⚠️ Reálnu platbu integruj podľa README.md (Stripe / GitHub Sponsors).
    localStorage.setItem(PAID_KEY, "1");
    setPaid(true);
    toast.success("Platba prijatá — môžeš stiahnuť tK1");
    setStep("download");
  };

  return (
    <div className="mx-auto max-w-5xl px-6 pt-14 pb-24">
      <div className="grid gap-12 lg:grid-cols-2 items-center">
        <div className="relative aspect-square overflow-hidden bg-card shadow-luxe">
          <img src={tk1Image} alt="tK1 AI" className="w-full h-full object-cover" />
        </div>

        <div>
          <div className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">Alvero · Access</div>
          <h1 className="font-display text-6xl md:text-7xl leading-none">tK1</h1>
          <p className="mt-3 text-sm tracking-[0.3em] uppercase text-muted-foreground">AI bez limitu</p>

          <ul className="mt-8 space-y-3 text-sm">
            <li className="flex gap-3"><InfinityIcon className="w-4 h-4 text-gold mt-0.5" /> Bez limitu používania</li>
            <li className="flex gap-3"><WifiOff className="w-4 h-4 text-gold mt-0.5" /> Funguje 100 % offline</li>
            <li className="flex gap-3"><ShieldCheck className="w-4 h-4 text-gold mt-0.5" /> Bez cenzúry</li>
            <li className="flex gap-3"><Lock className="w-4 h-4 text-gold mt-0.5" /> Stačí v aplikácii stlačiť <b className="text-foreground">ON</b> alebo <b className="text-foreground">GET</b></li>
          </ul>

          <div className="mt-8 flex items-baseline gap-3">
            <span className="font-display text-5xl text-gold">€{PRICE}</span>
            <span className="text-xs tracking-[0.3em] uppercase text-muted-foreground">jednorázovo</span>
          </div>

          <div className="mt-8">
            {step === "intro" && (
              <button
                onClick={startFlow}
                className="w-full bg-gold-gradient py-4 text-xs tracking-[0.4em] uppercase text-primary-foreground"
              >
                Získať tK1
              </button>
            )}

            {step === "age" && (
              <div className="border border-gold/40 p-6">
                <div className="text-[10px] tracking-[0.3em] uppercase text-gold mb-2">Overenie veku</div>
                <p className="font-display text-2xl mb-6">Máte viac ako 18 rokov?</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => answerAge(true)}
                    className="flex-1 bg-gold-gradient py-3 text-xs tracking-[0.4em] uppercase text-primary-foreground"
                  >Áno</button>
                  <button
                    onClick={() => answerAge(false)}
                    className="flex-1 border border-border py-3 text-xs tracking-[0.4em] uppercase hover:border-destructive"
                  >Nie</button>
                </div>
              </div>
            )}

            {step === "blocked" && blockedUntil && (
              <div className="border border-destructive/50 p-6 text-center">
                <div className="text-[10px] tracking-[0.3em] uppercase text-destructive mb-2">Prístup zamknutý</div>
                <p className="font-display text-2xl">Skúste znova o 7 dní</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(blockedUntil).toLocaleString("sk-SK")}
                </p>
              </div>
            )}

            {step === "pay" && (
              <div className="border border-gold/40 p-6">
                <div className="text-[10px] tracking-[0.3em] uppercase text-gold mb-2">Platba</div>
                <p className="text-sm text-muted-foreground mb-4">
                  Simulovaná platba — reálny terminál pridaj podľa <b>README.md</b>.
                </p>
                <button
                  onClick={fakePay}
                  className="w-full bg-gold-gradient py-4 text-xs tracking-[0.4em] uppercase text-primary-foreground"
                >
                  Zaplatiť €{PRICE}
                </button>
              </div>
            )}

            {step === "download" && (
              <div className="space-y-3">
                <div className="text-[10px] tracking-[0.3em] uppercase text-gold">
                  {paid ? "Prístup odomknutý" : "Stiahnuť"}
                </div>
                <a
                  href={DOWNLOAD_PC}
                  className="flex items-center justify-center gap-3 bg-gold-gradient py-4 text-xs tracking-[0.4em] uppercase text-primary-foreground"
                >
                  <Download className="w-4 h-4" /> Download · PC
                </a>
                <a
                  href={DOWNLOAD_MOBILE}
                  className="flex items-center justify-center gap-3 border border-gold py-4 text-xs tracking-[0.4em] uppercase text-gold"
                >
                  <Download className="w-4 h-4" /> Download · Mobile
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
