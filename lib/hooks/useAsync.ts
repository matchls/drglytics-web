// lib/hooks/useAsync.ts — Hook générique de chargement asynchrone.
//
// Analogie : c'est un "guichet automatique" — tu donnes un ticket (fetcher),
// il te rend le résultat quand il est prêt, et te dit s'il y a une erreur.
// Tu peux aussi appeler reload() pour redemander les données.
//
// Ce hook remplace le boilerplate useEffect/useState/loading/error qu'on
// retrouvait copié-collé dans chaque page et composant qui charge des données.

"use client";
import { useEffect, useState, useCallback, useRef } from "react";

export interface AsyncState<T> {
  /** Données chargées — null tant que le premier fetch n'a pas abouti. */
  data: T | null;
  /** true pendant le chargement (initial ou reload). */
  loading: boolean;
  /** Message d'erreur si le fetch a échoué, sinon null. */
  error: string | null;
  /** Relance le fetch manuellement (ex: après un submit dans le guestbook). */
  reload: () => Promise<void>;
}

/**
 * Hook générique pour charger des données asynchrones.
 *
 * Remplace le pattern répétitif :
 *   const [data, setData] = useState(null);
 *   const [loading, setLoading] = useState(true);
 *   useEffect(() => { fetch().then(setData); }, []);
 *
 * Usage :
 *   const { data, loading, error } = useAsync(() => fetchLeaderboard());
 *   const { data, reload }         = useAsync(() => fetchGuestbook());
 *   const { data, loading }        = useAsync(() => getProfile(name), [name]);
 *
 * @param fetcher  Fonction asynchrone qui retourne les données.
 * @param deps     Dépendances — un changement relance le fetch (comme useEffect).
 */
export function useAsync<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ref vers le dernier fetcher — évite de l'inclure dans les dépendances
  // du useCallback (sinon chaque rendu relancerait le fetch car le fetcher
  // est une nouvelle référence de fonction à chaque appel).
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  // Fonction de chargement stable (ne change jamais de référence grâce au
  // useCallback sans dépendance + ref). En cas d'erreur, les données
  // précédentes sont conservées (pattern "stale-while-error" comme SWR) :
  // utile lors d'un reload, l'utilisateur ne perd pas la vue des données
  // juste parce qu'un refresh a échoué.
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, []);

  // Exécute le fetch au montage et quand les dépendances changent.
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, reload: load };
}
