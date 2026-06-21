"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getPrefs, setPrefs, Preferences, DEFAULTS } from "@/lib/preferences";

// Le contexte : contient les prefs + une fonction pour les modifier
const PrefsContext = createContext<{
  prefs: Preferences;
  update: (partial: Partial<Preferences>) => void;
} | null>(null);

// Le Provider : à mettre une seule fois dans layout.tsx
export function PrefsProvider({ children }: { children: ReactNode }) {
  // On démarre TOUJOURS avec les valeurs par défaut — serveur et client sont ainsi identiques
  // lors du premier rendu (évite le crash d'hydration Next.js)
  const [prefs, setPrefsState] = useState<Preferences>(DEFAULTS);

  // Après hydration, on lit les vraies prefs depuis localStorage
  useEffect(() => {
    const p = getPrefs();
    setPrefsState(p);
    document.documentElement.lang = p.language;
  }, []);

  function update(partial: Partial<Preferences>) {
    setPrefs(partial);
    setPrefsState((prev) => {
      const next = { ...prev, ...partial };
      if (partial.language) document.documentElement.lang = partial.language;
      return next;
    });
  }

  return (
    <PrefsContext.Provider value={{ prefs, update }}>
      {children}
    </PrefsContext.Provider>
  );
}

// Le hook : n'importe quel composant appelle usePrefs() pour se "brancher"
export function usePrefs() {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error("usePrefs doit être utilisé dans un PrefsProvider");
  return ctx;
}
