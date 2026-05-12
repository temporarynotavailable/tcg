import Link from "next/link";
import {
  BadgeCheck,
  CheckCircle2,
  Crown,
  FileCheck2,
  LockKeyhole,
  ShieldAlert,
  ShieldCheck,
  Star,
  TrendingUp,
  User,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type TrustCenterProps = {
  user: {
    username: string;
    displayName: string;
    email: string;
    role: string;
    kycStatus: string;
    reputationScore: number;
    trustLevel: number;
    createdAt: string;
  };
  stats: {
    collectionItems: number;
    activeListings: number;
    soldListings: number;
    decks: number;
  };
};

function formatRole(role: string) {
  const map: Record<string, string> = {
    BASIC_USER: "Basic User",
    VERIFIED_USER: "Verified User",
    TRUSTED_MEMBER: "Trusted Member",
    MODERATOR: "Moderator",
    ADMIN: "Admin",
  };

  return map[role] ?? role;
}

function formatKycStatus(status: string) {
  const map: Record<string, string> = {
    NOT_STARTED: "Not Started",
    PENDING: "Pending",
    VERIFIED: "Verified",
    REJECTED: "Rejected",
  };

  return map[status] ?? status;
}

function getKycBadgeClass(status: string) {
  if (status === "VERIFIED") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "PENDING") return "border-amber-200 bg-amber-50 text-amber-700";
  if (status === "REJECTED") return "border-red-200 bg-red-50 text-red-700";

  return "border-slate-200 bg-white text-slate-700";
}

function getTrustedProgress(user: TrustCenterProps["user"]) {
  const checks = [
    {
      label: "KYC abgeschlossen",
      completed: user.kycStatus === "VERIFIED",
      description: "Identität wurde erfolgreich bestätigt.",
    },
    {
      label: "Reputation mindestens 80",
      completed: user.reputationScore >= 80,
      description: "Stabile Handels-Historie ohne starke Auffälligkeiten.",
    },
    {
      label: "Trust-Level mindestens 3",
      completed: user.trustLevel >= 3,
      description: "Genug positive Plattformaktivität gesammelt.",
    },
    {
      label: "Keine aktiven Verwarnungen",
      completed: true,
      description: "Später aus Moderationsdaten berechnet.",
    },
  ];

  const completed = checks.filter((check) => check.completed).length;
  const progress = Math.round((completed / checks.length) * 100);

  return { checks, completed, progress };
}

export function TrustCenter({ user, stats }: TrustCenterProps) {
  const trustedProgress = getTrustedProgress(user);
  const isTrusted = user.role === "TRUSTED_MEMBER";

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <Badge className="mb-4 rounded-full px-4 py-1">
            User Trust Center v0.1
          </Badge>

          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Trust Center
          </h1>

          <p className="mt-3 max-w-2xl text-slate-600">
            Verwalte deine Vertrauensstufe, KYC-Verifizierung, Reputation und
            zukünftige Trusted-Member-Rechte.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>

          <Button>
            <ShieldCheck className="mr-2 h-4 w-4" />
            KYC starten
          </Button>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="overflow-hidden rounded-3xl">
          <CardContent className="p-0">
            <div className="bg-slate-950 p-6 text-white">
              <div className="flex items-start gap-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10">
                  <User className="h-8 w-8" />
                </div>

                <div>
                  <p className="text-sm text-slate-400">Account</p>
                  <h2 className="mt-1 text-3xl font-semibold">
                    {user.displayName || user.username}
                  </h2>
                  <p className="mt-1 text-sm text-slate-300">{user.email}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <Badge variant="secondary" className="rounded-full">
                  {formatRole(user.role)}
                </Badge>

                <Badge variant="secondary" className="rounded-full">
                  Trust Level {user.trustLevel}
                </Badge>

                {isTrusted && (
                  <Badge variant="secondary" className="rounded-full">
                    <Crown className="mr-1 h-3.5 w-3.5" />
                    Trusted Member
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid gap-4 bg-white p-6 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">KYC Status</p>
                <div className="mt-2">
                  <Badge
                    variant="outline"
                    className={getKycBadgeClass(user.kycStatus)}
                  >
                    {formatKycStatus(user.kycStatus)}
                  </Badge>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Reputation</p>
                <p className="mt-2 text-2xl font-semibold">
                  {user.reputationScore}/100
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Aktive Listings</p>
                <p className="mt-2 text-2xl font-semibold">
                  {stats.activeListings}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Sammlungseinträge</p>
                <p className="mt-2 text-2xl font-semibold">
                  {stats.collectionItems}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-5">
              <div>
                <h2 className="text-2xl font-semibold">
                  Trusted Member Fortschritt
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Trusted Member erhalten später höhere Limits, schnellere
                  Freigaben, reduzierte Treuhandanforderungen und zusätzliche
                  Datenbankrechte.
                </p>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100">
                <Crown className="h-6 w-6" />
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex justify-between text-sm">
                <span>Fortschritt</span>
                <span>{trustedProgress.progress}%</span>
              </div>

              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-slate-950"
                  style={{ width: `${trustedProgress.progress}%` }}
                />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {trustedProgress.checks.map((check) => (
                <div
                  key={check.label}
                  className="flex items-start gap-3 rounded-2xl border bg-white p-4"
                >
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                      check.completed
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="font-medium">{check.label}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {check.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-3xl">
          <CardContent className="p-6">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
              <BadgeCheck className="h-5 w-5" />
            </div>

            <p className="text-sm text-slate-500">Seller Status</p>
            <p className="mt-2 text-2xl font-semibold">
              {formatRole(user.role)}
            </p>

            <p className="mt-4 text-sm leading-6 text-slate-500">
              Bestimmt Limits, Review-Pflichten und spätere Auszahlungsgeschwindigkeit.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardContent className="p-6">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
              <Star className="h-5 w-5" />
            </div>

            <p className="text-sm text-slate-500">Reputation</p>
            <p className="mt-2 text-2xl font-semibold">
              {user.reputationScore}
            </p>

            <p className="mt-4 text-sm leading-6 text-slate-500">
              Später aus erfolgreichen Verkäufen, Bewertungen und Disputes berechnet.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardContent className="p-6">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
              <FileCheck2 className="h-5 w-5" />
            </div>

            <p className="text-sm text-slate-500">Decks</p>
            <p className="mt-2 text-2xl font-semibold">{stats.decks}</p>

            <p className="mt-4 text-sm leading-6 text-slate-500">
              Später können geprüfte Decks als Premium-Listings verkauft werden.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl bg-slate-950 text-white">
          <CardContent className="p-6">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
              <TrendingUp className="h-5 w-5" />
            </div>

            <p className="text-sm text-slate-400">Trust Level</p>
            <p className="mt-2 text-2xl font-semibold">
              Level {user.trustLevel}
            </p>

            <p className="mt-4 text-sm leading-6 text-slate-400">
              Grundlage für reduzierte Escrow-Anforderungen und mehr Plattformrechte.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Card className="rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                <ShieldAlert className="h-6 w-6" />
              </div>

              <div>
                <h2 className="text-xl font-semibold">
                  Anti-Scam Regeln
                </h2>

                <p className="mt-2 leading-7 text-slate-600">
                  Für neue oder nicht verifizierte Nutzer können teure Listings,
                  Binder-Sales oder auffällige Verkaufsmuster automatisch in die
                  Review Queue verschoben werden.
                </p>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {[
                    "KYC vor höheren Verkaufslimits",
                    "Review Queue für Risiko-Listings",
                    "Trusted Member mit besseren Rechten",
                    "Dispute- und Moderationshistorie",
                  ].map((item) => (
                    <div key={item} className="rounded-2xl bg-slate-50 p-4 text-sm">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl bg-slate-950 text-white">
          <CardContent className="p-6">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <LockKeyhole className="h-6 w-6" />
            </div>

            <h2 className="text-xl font-semibold">
              Spätere Trusted-Member-Rechte
            </h2>

            <div className="mt-5 space-y-3">
              {[
                "Neue Karten schneller anlegen",
                "Reduzierte Treuhandpflicht",
                "Höhere Verkaufslimits",
                "Schnellere Listing-Freigabe",
                "Bessere Sichtbarkeit als Verkäufer",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/10 p-4">
                  <CheckCircle2 className="h-4 w-4 text-slate-300" />
                  <span className="text-sm text-slate-200">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}