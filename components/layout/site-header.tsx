"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  LayoutDashboard,
  ReceiptText,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trophy,
  User,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const GAME_SLUGS = ["pokemon", "one-piece", "magic", "lorcana", "yu-gi-oh"];

function getActiveGameSlug(pathname: string) {
  const firstSegment = pathname.split("/").filter(Boolean)[0];

  if (GAME_SLUGS.includes(firstSegment)) {
    return firstSegment;
  }

  return "pokemon";
}

function getGameLabel(gameSlug: string) {
  const labels: Record<string, string> = {
    pokemon: "Pokémon",
    "one-piece": "One Piece",
    magic: "Magic",
    lorcana: "Lorcana",
    "yu-gi-oh": "Yu-Gi-Oh!",
  };

  return labels[gameSlug] ?? "Pokémon";
}

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const activeGameSlug = getActiveGameSlug(pathname);
  const activeGameLabel = getGameLabel(activeGameSlug);

  const gameNavItems = [
    {
      href: `/${activeGameSlug}/dashboard`,
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: `/${activeGameSlug}/collection`,
      label: "Collection",
      icon: Boxes,
    },
    {
      href: `/${activeGameSlug}/marketplace`,
      label: "Marketplace",
      icon: Search,
    },
    {
      href: `/${activeGameSlug}/sell`,
      label: "Sell",
      icon: ShoppingBag,
    },
    {
      href: `/${activeGameSlug}/orders`,
      label: "Orders",
      icon: ReceiptText,
    },
    {
      href: `/${activeGameSlug}/decks`,
      label: "Decks",
      icon: Trophy,
    },
  ];

  const globalNavItems = [
    {
      href: "/admin",
      label: "Admin",
      icon: ShieldCheck,
    },
    {
      href: "/profile",
      label: "Profile",
      icon: User,
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/${activeGameSlug}/dashboard`}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <Sparkles className="h-5 w-5" />
            </div>

            <div>
              <p className="text-base font-semibold tracking-tight">
                TCG Nexus
              </p>
              <p className="text-xs text-slate-500">
                Game-scoped marketplace
              </p>
            </div>
          </Link>

          <Badge variant="outline" className="rounded-full px-3 py-1">
            Aktiver Bereich: {activeGameLabel}
          </Badge>
        </div>

        <nav className="flex flex-wrap items-center gap-2">
          {gameNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(pathname, item.href);

            return (
              <Button
                key={item.href}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className="rounded-full"
                asChild
              >
                <Link href={item.href}>
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            );
          })}

          <div className="mx-1 hidden h-6 w-px bg-slate-200 lg:block" />

          {globalNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(pathname, item.href);

            return (
              <Button
                key={item.href}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className="rounded-full"
                asChild
              >
                <Link href={item.href}>
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}