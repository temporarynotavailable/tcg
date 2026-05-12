import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <AuthShell
      mode="login"
      title="Willkommen zurück."
      description="Logge dich ein, um deine Sammlung, Listings, Decks und Trust-Daten zu verwalten."
    >
      <form className="mt-8 space-y-4">
        <div>
          <label className="text-sm font-medium">E-Mail</label>
          <Input
            className="mt-2"
            type="email"
            placeholder="du@example.com"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Passwort</label>
            <Link
              href="#"
              className="text-sm font-medium text-slate-600 hover:text-slate-950"
            >
              Passwort vergessen?
            </Link>
          </div>

          <Input
            className="mt-2"
            type="password"
            placeholder="••••••••"
          />
        </div>

        <Button className="w-full" size="lg" type="button">
          Einloggen
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>

        <Button className="w-full" size="lg" variant="outline" type="button">
          <Mail className="mr-2 h-4 w-4" />
          Magic Link senden
        </Button>
      </form>

      <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-500">
        Später verbinden wir diese Seite mit Auth, KYC-Status, Rollen und
        deinem User-Dashboard.
      </div>
    </AuthShell>
  );
}