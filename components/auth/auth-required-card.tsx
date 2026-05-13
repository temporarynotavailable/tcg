import { ArrowRight, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";

import { HomeAuthActions } from "@/components/home/home-auth-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type AuthRequiredCardProps = {
  title?: string;
  description?: string;
  games: {
    id: string;
    name: string;
    slug: string;
  }[];
};

export function AuthRequiredCard({
  title = "Login erforderlich.",
  description = "Melde dich ein, um diesen Bereich zu nutzen. Neue Accounts werden ausschließlich über die Startseite erstellt.",
  games,
}: AuthRequiredCardProps) {
  return (
    <Card className="rounded-[2rem]">
      <CardContent className="grid gap-8 p-8 md:grid-cols-[1fr_0.85fr] md:items-center">
        <div>
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-950 text-white">
            <LockKeyhole className="h-7 w-7" />
          </div>

          <Badge className="mb-4 rounded-full px-4 py-1">
            Login erforderlich
          </Badge>

          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            {title}
          </h1>

          <p className="mt-4 max-w-2xl text-slate-600">{description}</p>

          <div className="mt-8">
            <HomeAuthActions
              games={games}
              showRegister={false}
              displayMode="modal"
            />
          </div>
        </div>

        <div className="rounded-3xl bg-slate-950 p-6 text-white">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
            <Sparkles className="h-6 w-6" />
          </div>

          <h2 className="text-2xl font-semibold">
            Ein Account für alle TCGs.
          </h2>

          <p className="mt-3 leading-7 text-slate-300">
            Nach dem Login wird automatisch dein Favourite-TCG geladen. Deine
            Hubseite, News und Hot Picks richten sich nach deinen ausgewählten
            Spielen.
          </p>

          <div className="mt-6 space-y-3">
            {[
              "Favourite-TCG als Standardbereich",
              "Persönliche TCG-Auswahl",
              "Profileinstellungen verwalten",
              "Später KYC, Trust-Level und Rewards",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-sm text-slate-200"
              >
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                {item}
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-2 text-sm text-slate-300">
            Weiter nach Login
            <ArrowRight className="h-4 w-4" />
            Favourite Dashboard
          </div>
        </div>
      </CardContent>
    </Card>
  );
}