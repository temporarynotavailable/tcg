"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
  Star,
  UserPlus,
  X,
} from "lucide-react";

import { loginUserAction, registerUserAction } from "@/app/auth/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type HomeAuthActionsProps = {
  games: {
    id: string;
    name: string;
    slug: string;
  }[];
  showRegister?: boolean;
  displayMode?: "dropdown" | "modal";
};

type ActivePanel = "login" | "register" | null;

function getShortGameName(name: string) {
  if (name === "Magic: The Gathering") return "Magic";
  if (name === "One Piece Card Game") return "One Piece";
  if (name === "Disney Lorcana") return "Lorcana";

  return name;
}

export function HomeAuthActions({
  games,
  showRegister = true,
  displayMode = "dropdown",
}: HomeAuthActionsProps) {
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

  const defaultSelectedGameIds = useMemo(() => {
    return games.map((game) => game.id);
  }, [games]);

  const [selectedGameIds, setSelectedGameIds] = useState<string[]>(
    defaultSelectedGameIds,
  );

  const [favoriteGameId, setFavoriteGameId] = useState(
    defaultSelectedGameIds[0] ?? "",
  );

  const authRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSelectedGameIds(defaultSelectedGameIds);
    setFavoriteGameId(defaultSelectedGameIds[0] ?? "");
  }, [defaultSelectedGameIds]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActivePanel(null);
      }
    }

    function handleClickOutside(event: MouseEvent) {
      if (displayMode !== "dropdown") return;

      if (authRef.current && !authRef.current.contains(event.target as Node)) {
        setActivePanel(null);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [displayMode]);

  function toggleGame(gameId: string) {
    setSelectedGameIds((current) => {
      const isSelected = current.includes(gameId);

      const nextSelected = isSelected
        ? current.filter((id) => id !== gameId)
        : [...current, gameId];

      if (nextSelected.length === 0) {
        setFavoriteGameId("");
        return nextSelected;
      }

      if (!nextSelected.includes(favoriteGameId)) {
        setFavoriteGameId(nextSelected[0]);
      }

      if (nextSelected.length === 1) {
        setFavoriteGameId(nextSelected[0]);
      }

      return nextSelected;
    });
  }

  function openLogin() {
    setActivePanel((current) => (current === "login" ? null : "login"));
  }

  function openRegister() {
    if (!showRegister) return;

    setActivePanel((current) => (current === "register" ? null : "register"));
  }

  function closePanel() {
    setActivePanel(null);
  }

  function renderLoginPanel() {
    return (
      <div className="p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <Badge className="mb-3 rounded-full px-3 py-1">
              Willkommen zurück
            </Badge>

            <h3 className="text-2xl font-semibold tracking-tight">
              Einloggen
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Nach dem Login öffnet sich dein Favourite-TCG automatisch.
            </p>
          </div>

          <button
            type="button"
            onClick={closePanel}
            className="flex h-9 w-9 items-center justify-center rounded-full border bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
            aria-label="Login schließen"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form action={loginUserAction} className="space-y-4">
          <div>
            <label className="text-sm font-medium">E-Mail</label>
            <div className="mt-2 flex h-11 items-center gap-2 rounded-md border border-input bg-background px-3 shadow-sm">
              <Mail className="h-4 w-4 text-slate-400" />
              <input
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Passwort</label>
            <div className="mt-2 flex h-11 items-center gap-2 rounded-md border border-input bg-background px-3 shadow-sm">
              <Lock className="h-4 w-4 text-slate-400" />
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            Einloggen
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>

        <div className="mt-4 flex items-center justify-between gap-3 text-sm">
          <button
            type="button"
            className="text-slate-500 underline-offset-4 hover:text-slate-950 hover:underline"
          >
            Passwort vergessen?
          </button>

          {showRegister ? (
            <button
              type="button"
              onClick={() => setActivePanel("register")}
              className="font-medium text-slate-950 underline-offset-4 hover:underline"
            >
              Account erstellen
            </button>
          ) : (
            <span className="text-right text-xs leading-5 text-slate-400">
              Registrierung nur auf der Startseite
            </span>
          )}
        </div>
      </div>
    );
  }

  function renderRegisterPanel() {
    if (!showRegister) return null;

    return (
      <div className="p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <Badge className="mb-3 rounded-full px-3 py-1">
              Account erstellen
            </Badge>

            <h3 className="text-2xl font-semibold tracking-tight">
              Registrieren
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Wähle deine interessanten TCGs und dein Favourite als
              Standardbereich.
            </p>
          </div>

          <button
            type="button"
            onClick={closePanel}
            className="flex h-9 w-9 items-center justify-center rounded-full border bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
            aria-label="Registrierung schließen"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form action={registerUserAction} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Username</label>
              <div className="mt-2 flex h-11 items-center gap-2 rounded-md border border-input bg-background px-3 shadow-sm">
                <UserPlus className="h-4 w-4 text-slate-400" />
                <input
                  name="username"
                  required
                  placeholder="CardVault"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Anzeigename</label>
              <div className="mt-2 flex h-11 items-center gap-2 rounded-md border border-input bg-background px-3 shadow-sm">
                <ShieldCheck className="h-4 w-4 text-slate-400" />
                <input
                  name="displayName"
                  required
                  placeholder="CardVault"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">E-Mail</label>
            <div className="mt-2 flex h-11 items-center gap-2 rounded-md border border-input bg-background px-3 shadow-sm">
              <Mail className="h-4 w-4 text-slate-400" />
              <input
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Passwort</label>
            <div className="mt-2 flex h-11 items-center gap-2 rounded-md border border-input bg-background px-3 shadow-sm">
              <Lock className="h-4 w-4 text-slate-400" />
              <input
                name="password"
                type="password"
                required
                minLength={8}
                placeholder="Mindestens 8 Zeichen"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="rounded-3xl bg-slate-50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-slate-500" />
              <p className="text-sm font-medium">Interessante TCGs</p>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              {games.map((game) => {
                const isSelected = selectedGameIds.includes(game.id);
                const isFavorite = favoriteGameId === game.id;

                return (
                  <div
                    key={game.id}
                    className={`rounded-2xl border bg-white p-3 transition ${
                      isSelected
                        ? "border-slate-950"
                        : "border-slate-200 opacity-70"
                    }`}
                  >
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        name="interestedGameIds"
                        value={game.id}
                        checked={isSelected}
                        onChange={() => toggleGame(game.id)}
                        className="mt-1"
                      />

                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {getShortGameName(game.name)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {game.slug}
                        </p>
                      </div>
                    </label>

                    <label
                      className={`mt-3 flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-xs ${
                        isSelected
                          ? "bg-slate-50 text-slate-700"
                          : "bg-slate-50 text-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="favoriteGameId"
                        value={game.id}
                        checked={isFavorite}
                        disabled={!isSelected}
                        onChange={() => setFavoriteGameId(game.id)}
                      />
                      <Star className="h-3.5 w-3.5" />
                      Favourite / Standard
                    </label>
                  </div>
                );
              })}
            </div>

            {selectedGameIds.length === 0 && (
              <p className="mt-3 text-sm text-red-600">
                Bitte wähle mindestens ein TCG aus.
              </p>
            )}
          </div>

          <div className="rounded-3xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            Nach dem Login wird automatisch dein Favourite-TCG geöffnet. Wenn du
            nur ein TCG auswählst, wird dieses automatisch dein Standardbereich.
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={selectedGameIds.length === 0 || !favoriteGameId}
          >
            Account erstellen
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Schon registriert?{" "}
          <button
            type="button"
            onClick={() => setActivePanel("login")}
            className="font-medium text-slate-950 underline-offset-4 hover:underline"
          >
            Zum Login
          </button>
        </p>
      </div>
    );
  }

  const panel =
    activePanel === "login" ? renderLoginPanel() : renderRegisterPanel();

  return (
    <>
      <div ref={authRef} className="relative flex shrink-0 items-center gap-2">
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={openLogin}
          >
            <LogIn className="mr-2 h-4 w-4" />
            Login
          </Button>

          {displayMode === "dropdown" && activePanel === "login" && (
            <div className="absolute right-0 top-full z-50 mt-3 w-[360px] rounded-[1.75rem] border bg-white shadow-2xl">
              {panel}
            </div>
          )}
        </div>

        {showRegister && (
          <div className="relative">
            <Button
              type="button"
              size="sm"
              className="rounded-full"
              onClick={openRegister}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Registrieren
            </Button>

            {displayMode === "dropdown" && activePanel === "register" && (
              <div className="absolute right-0 top-full z-50 mt-3 w-[620px] rounded-[1.75rem] border bg-white shadow-2xl">
                {panel}
              </div>
            )}
          </div>
        )}
      </div>

      {displayMode === "modal" && activePanel && (
        <div
          className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/60 px-4 py-8 backdrop-blur-sm"
          onMouseDown={closePanel}
        >
          <div
            className={`mx-auto mt-10 w-full rounded-[2rem] bg-white shadow-2xl ${
              activePanel === "login" ? "max-w-md" : "max-w-3xl"
            }`}
            onMouseDown={(event) => event.stopPropagation()}
          >
            {panel}
          </div>
        </div>
      )}
    </>
  );
}