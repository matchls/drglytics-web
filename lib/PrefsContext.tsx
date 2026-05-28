"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { getPrefs, setPrefs, Preferences } from "@/lib/preferences";

// Le contexte : contient les prefs + une fonction pour les modifier
const PrefsContext = createContext<{
  prefs: Preferences;
  update: (partial: Partial<Preferences>) => void;
} | null>(null);

// Le Provider : à mettre une seule fois dans layout.tsx
export function PrefsProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefsState] = useState<Preferences>(getPrefs());

  function update(partial: Partial<Preferences>) {
    setPrefs(partial); // sauvegarde dans localStorage
    setPrefsState((prev) => ({ ...prev, ...partial })); // met à jour le state React → re-render
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
