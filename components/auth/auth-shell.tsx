import Link from "next/link";
import { ShieldCheck, Sparkles } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type AuthShellProps = {
  children: React.ReactNode;
  title: string;
  description: string;
  mode: "login" | "register";
};

export function AuthShell({
  children,
  title,
  description,
  mode,
}: AuthShellProps) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[1fr_0.9fr]">
        <section className="flex flex-col px-6 py-8">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <span>TCG Nexus</span>
          </Link>

          <div className="flex flex-1 items-center justify-center py-12">
            <Card className="w-full max-w-md rounded-3xl">
              <CardContent className="p-6 md:p-8">
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight">
                    {title}
                  </h1>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {description}
                  </p>
                </div>

                {children}

                <div className="mt-6 text-center text-sm text-slate-500">
                  {mode === "login" ? (
                    <>
                      Noch kein Konto?{" "}
                      <Link
                        href="/register"
                        className="font-medium text-slate-950 hover:underline"
                      >
                        Jetzt registrieren
                      </Link>
                    </>
                  ) : (
                    <>
                      Bereits registriert?{" "}
                      <Link
                        href="/login"
                        className="font-medium text-slate-950 hover:underline"
                      >
                        Einloggen
                      </Link>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="hidden bg-slate-950 p-8 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-slate-200 w-fit">
            <ShieldCheck className="h-4 w-4" />
            KYC-first marketplace
          </div>

          <div>
            <h2 className="max-w-xl text-5xl font-semibold tracking-tight">
              Sicherer TCG-Handel beginnt mit Vertrauen.
            </h2>

            <p className="mt-5 max-w-lg leading-7 text-slate-300">
              TCG Nexus kombiniert KYC, Reputation, Trusted Member-Level und
              spätere Treuhandlogik, um Scammer, Fake-Angebote und riskante
              Trades deutlich zu reduzieren.
            </p>

            <div className="mt-10 grid gap-4">
              {[
                ["Verifizierte Nutzer", "KYC und Reputation als Vertrauensbasis"],
                ["Trusted Member", "Mehr Rechte durch erfolgreiche Transaktionen"],
                ["Moderation", "Reports, Reviews und Listing-Prüfung"],
              ].map(([title, text]) => (
                <div key={title} className="rounded-3xl bg-white/10 p-5">
                  <p className="font-medium">{title}</p>
                  <p className="mt-1 text-sm text-slate-300">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-slate-400">
            TCG Nexus · Multi-TCG Marketplace · AI Recognition · Price Intelligence
          </p>
        </section>
      </div>
    </main>
  );
}