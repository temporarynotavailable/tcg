"use client";

import { useState } from "react";
import { Check, Languages, Moon, Palette, Sun } from "lucide-react";

import { Badge } from "@/components/ui/badge";

const skins = [
  {
    id: "light",
    label: "White",
    icon: Sun,
  },
  {
    id: "dark",
    label: "Dark",
    icon: Moon,
  },
];

const languages = [
  {
    id: "de",
    label: "DE",
  },
  {
    id: "en",
    label: "EN",
  },
];

export function HomePreferences() {
  const [selectedSkin, setSelectedSkin] = useState("light");
  const [selectedLanguage, setSelectedLanguage] = useState("de");

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 rounded-full border bg-white px-2 py-1 shadow-sm">
        <div className="flex items-center gap-1 pl-2 text-xs font-medium text-slate-500">
          <Palette className="h-3.5 w-3.5" />
          Skin
        </div>

        <div className="flex rounded-full bg-slate-100 p-1">
          {skins.map((skin) => {
            const Icon = skin.icon;
            const isSelected = selectedSkin === skin.id;

            return (
              <button
                key={skin.id}
                type="button"
                onClick={() => setSelectedSkin(skin.id)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition ${
                  isSelected
                    ? "bg-slate-950 text-white shadow-sm"
                    : "text-slate-600 hover:bg-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {skin.label}
                {isSelected && <Check className="h-3 w-3" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-full border bg-white px-2 py-1 shadow-sm">
        <div className="flex items-center gap-1 pl-2 text-xs font-medium text-slate-500">
          <Languages className="h-3.5 w-3.5" />
          Sprache
        </div>

        <div className="flex rounded-full bg-slate-100 p-1">
          {languages.map((language) => {
            const isSelected = selectedLanguage === language.id;

            return (
              <button
                key={language.id}
                type="button"
                onClick={() => setSelectedLanguage(language.id)}
                className={`rounded-full px-3 py-1.5 text-xs transition ${
                  isSelected
                    ? "bg-slate-950 text-white shadow-sm"
                    : "text-slate-600 hover:bg-white"
                }`}
              >
                {language.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}