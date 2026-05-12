import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const trustSteps = [
  "E-Mail bestätigen",
  "Basisprofil erstellen",
  "KYC-Verifizierung starten",
  "Reputation durch sichere Trades aufbauen",
];

export default function RegisterPage() {
  return (
    <AuthShell
      mode="register"
      title="Konto erstellen."
      description="Starte als Basic User und baue dir Schritt für Schritt Reputation bis zum Trusted Member auf."
    >
      <form className="mt-8 space-y-4">
        <div>
          <label className="text-sm font-medium">Benutzername</label>
          <Input className="mt-2" placeholder="z.B. CardVault" />
        </div>

        <div>
          <label className="text-sm font-medium">E-Mail</label>
          <Input
            className="mt-2"
            type="email"
            placeholder="du@example.com"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Passwort</label>
          <Input
            className="mt-2"
            type="password"
            placeholder="Mindestens 8 Zeichen"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Lieblings-TCG</label>
          <Input
            className="mt-2"
            placeholder="Pokémon, One Piece, Magic..."
          />
        </div>

        <div className="rounded-2xl border bg-slate-50 p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-slate-700" />
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">KYC wird später benötigt</p>
                <Badge variant="outline">Trust Layer</Badge>
              </div>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Für reguläres Verkaufen, höhere Limits und Trusted-Member-Rechte
                wird später eine Identitätsprüfung notwendig.
              </p>
            </div>
          </div>
        </div>

        <Button className="w-full" size="lg" type="button">
          Konto erstellen
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>

      <div className="mt-6 rounded-3xl bg-slate-950 p-5 text-white">
        <p className="font-medium">Trust Journey</p>

        <div className="mt-4 space-y-3">
          {trustSteps.map((step) => (
            <div key={step} className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-slate-300" />
              <span className="text-sm text-slate-300">{step}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-5 text-center text-xs leading-5 text-slate-500">
        Mit der Registrierung akzeptierst du später unsere{" "}
        <Link href="#" className="font-medium text-slate-950 hover:underline">
          Nutzungsbedingungen
        </Link>{" "}
        und{" "}
        <Link href="#" className="font-medium text-slate-950 hover:underline">
          Datenschutzrichtlinien
        </Link>
        .
      </p>
    </AuthShell>
  );
}