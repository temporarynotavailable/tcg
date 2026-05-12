import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Sparkles } from "lucide-react";

const navItems = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/collection", label: "Collection" },
  { href: "/decks", label: "Decks" },
  { href: "/sell", label: "Sell" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <div className="flex size-9 items-center justify-center rounded-xl bg-slate-950 text-white">
            <Sparkles className="size-4" />
          </div>
          <span>TCG Nexus</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-slate-950">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1 rounded-full border px-3 py-1 text-xs text-slate-600 md:flex">
            <ShieldCheck className="size-3.5" />
            KYC-first marketplace
          </div>
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Starten</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}