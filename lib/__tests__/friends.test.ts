import { describe, it, expect, beforeEach } from "vitest";
import {
  normalizeName,
  getFriends,
  addFriend,
  removeFriend,
  isFriend,
} from "@/lib/friends";

describe("normalizeName", () => {
  it("met en majuscules", () => {
    expect(normalizeName("rockman")).toBe("ROCKMAN");
  });

  it("retire les espaces de bord", () => {
    expect(normalizeName("  Karl  ")).toBe("KARL");
  });

  it("est stable (idempotent)", () => {
    expect(normalizeName(normalizeName("Scout"))).toBe("SCOUT");
  });
});

describe("friends (localStorage)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("getFriends retourne [] si vide", () => {
    expect(getFriends()).toEqual([]);
  });

  it("addFriend ajoute un ami normalisé", () => {
    addFriend("driller");
    expect(getFriends()).toContain("DRILLER");
  });

  it("addFriend n'ajoute pas deux fois le même ami", () => {
    addFriend("gunner");
    addFriend("GUNNER");
    expect(getFriends()).toHaveLength(1);
  });

  it("removeFriend supprime un ami", () => {
    addFriend("scout");
    removeFriend("SCOUT");
    expect(getFriends()).toHaveLength(0);
  });

  it("isFriend retourne true pour un ami existant", () => {
    addFriend("engineer");
    expect(isFriend("engineer")).toBe(true);
    expect(isFriend("ENGINEER")).toBe(true);
  });

  it("isFriend retourne false si absent", () => {
    expect(isFriend("unknown")).toBe(false);
  });
});
