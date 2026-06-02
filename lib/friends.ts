// Gestion de la liste d'amis en localStorage
// Les noms sont stockés en majuscules pour correspondre à player_name dans Supabase

const KEY = "drg_friends";

/**
 * Forme canonique d'un pseudo pour COMPARAISON (insensible à la casse et aux
 * espaces de bord). C'est la SEULE règle de normalisation de l'app : amis,
 * leaderboard et livre d'or doivent tous passer par ici plutôt que de
 * réimplémenter `.trim().toUpperCase()` à la main.
 *
 * À ne pas confondre avec le nom d'AFFICHAGE, qui conserve la casse d'origine.
 */
export function normalizeName(name: string): string {
  return name.trim().toUpperCase();
}

export function getFriends(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function addFriend(name: string): void {
  const normalized = normalizeName(name);
  const friends = getFriends();
  if (!friends.includes(normalized)) {
    localStorage.setItem(KEY, JSON.stringify([...friends, normalized]));
  }
}

export function removeFriend(name: string): void {
  const normalized = normalizeName(name);
  localStorage.setItem(
    KEY,
    JSON.stringify(getFriends().filter((f) => f !== normalized)),
  );
}

export function isFriend(name: string): boolean {
  return getFriends().includes(normalizeName(name));
}
