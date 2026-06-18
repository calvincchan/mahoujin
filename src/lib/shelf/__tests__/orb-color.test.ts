import { describe, it, expect } from "vitest";
import { getPowerOrbColor } from "../orb-color";

describe("getPowerOrbColor", () => {
  it("fire returns crimson primary", () => {
    const { primary } = getPowerOrbColor(["fire"]);
    expect(primary).toBe("#dc2626");
  });

  it("water returns cyan-blue primary", () => {
    const { primary } = getPowerOrbColor(["water"]);
    expect(primary).toBe("#0284c7");
  });

  it("mystery returns prismatic violet primary", () => {
    const { primary } = getPowerOrbColor(["mystery"]);
    expect(primary).toBe("#6d28d9");
  });

  it("unknown power returns Normal fallback colours", () => {
    const { primary, secondary } = getPowerOrbColor(["unknownpower"]);
    expect(primary).toBe("#a8a878");
    expect(secondary).toBe("#c8c8a0");
  });

  it("uses the first power (dominant) from the array", () => {
    const { primary } = getPowerOrbColor(["fire", "water", "ice"]);
    expect(primary).toBe("#dc2626");
  });

  it("empty array falls back to mystery palette", () => {
    const { primary } = getPowerOrbColor([]);
    expect(primary).toBe("#6d28d9");
  });

  it("returns non-empty hex pairs for common powers", () => {
    const powers = ["fire", "water", "lightning", "ice", "shadow", "light", "wind", "nature", "earth", "mystery", "ghost", "psychic", "poison", "rock"];
    for (const p of powers) {
      const { primary, secondary } = getPowerOrbColor([p]);
      expect(primary).toMatch(/^#[0-9a-f]{6}$/i);
      expect(secondary).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});
