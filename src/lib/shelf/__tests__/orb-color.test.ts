import { describe, it, expect } from "vitest";
import { getElementOrbColor } from "../orb-color";

describe("getElementOrbColor", () => {
  it("Fire returns crimson primary", () => {
    const { primary } = getElementOrbColor("Fire");
    expect(primary).toBe("#dc2626");
  });

  it("Water returns cyan-blue primary", () => {
    const { primary } = getElementOrbColor("Water");
    expect(primary).toBe("#0284c7");
  });

  it("Stellar returns prismatic violet primary", () => {
    const { primary } = getElementOrbColor("Stellar");
    expect(primary).toBe("#6d28d9");
  });

  it("all 19 elements return non-empty hex pairs", () => {
    const elements = [
      "Normal", "Fire", "Water", "Grass", "Electric", "Ice",
      "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug",
      "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy", "Stellar",
    ] as const;
    for (const el of elements) {
      const { primary, secondary } = getElementOrbColor(el);
      expect(primary).toMatch(/^#[0-9a-f]{6}$/i);
      expect(secondary).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});
