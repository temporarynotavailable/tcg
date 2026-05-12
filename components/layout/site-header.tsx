"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  LayoutDashboard,
  Menu,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trophy,
  User,
  Wrench,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/marketplace",
    label: "Marketplace",
    icon: Search,
  },
  {
    href: "/collection",
    label: "Collection",
    icon: Boxes,
  },
  {
    href: "/decks",
    label: "Decks",
    icon: Trophy,
  },
  {
    href: "/sell",
    label: "Sell",
    icon: ShoppingBag,
  },
  {
  href: "/profile",
  label: "Profile",
  icon: User,
},
    {
    href: "/admin",
    label: "Admin",
    icon: Wrench,
  },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white">
            <Sparkles className="h-4 w-4" />
          </div>

          <div className="leading-tight">
            <span className="block">TCG Nexus</span>
            <span className="hidden text-xs font-normal text-slate-500 sm:block">
              Trade smarter
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border bg-white p-1 text-sm shadow-sm lg:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-full px-4 py-2 transition ${
                  isActive
                    ? "bg-slate-950 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <div className="flex items-center gap-1 rounded-full border px-3 py-1 text-xs text-slate-600">
            <ShieldCheck className="h-3.5 w-3.5" />
            KYC-first
          </div>

          <Button variant="ghost" asChild>
            <Link href="/login">
              <User className="mr-2 h-4 w-4" />
              Login
            </Link>
          </Button>

          <Button asChild>
            <Link href="/register">Starten</Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Button variant="outline" size="icon">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <nav className="border-t bg-white px-4 py-3 lg:hidden">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                  isActive
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}