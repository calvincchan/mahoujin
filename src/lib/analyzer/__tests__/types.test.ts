import { describe, it, expect } from "vitest";
import { CreatureAttributesSchema } from "../types";

const VALID = {
  archetype: "dragon",
  element: "fire",
  trait: "fierce",
  stats: { hp: 80, mp: 60, atk: 90, def: 70 },
  rarity: 3,
  confidence: "high",
};

describe("CreatureAttributesSchema", () => {
  it("accepts valid payload", () => {
    expect(() => CreatureAttributesSchema.parse(VALID)).not.toThrow();
  });

  it("rejects invalid element enum", () => {
    expect(() =>
      CreatureAttributesSchema.parse({ ...VALID, element: "lightning" })
    ).toThrow();
  });

  it("rejects invalid confidence enum", () => {
    expect(() =>
      CreatureAttributesSchema.parse({ ...VALID, confidence: "medium" })
    ).toThrow();
  });

  it("rejects rarity 0", () => {
    expect(() =>
      CreatureAttributesSchema.parse({ ...VALID, rarity: 0 })
    ).toThrow();
  });

  it("rejects rarity 6", () => {
    expect(() =>
      CreatureAttributesSchema.parse({ ...VALID, rarity: 6 })
    ).toThrow();
  });

  it("rejects missing stats field", () => {
    const { hp: _hp, ...statsWithoutHp } = VALID.stats;
    expect(() =>
      CreatureAttributesSchema.parse({ ...VALID, stats: statsWithoutHp })
    ).toThrow();
  });

  it("rejects stat value out of range (0)", () => {
    expect(() =>
      CreatureAttributesSchema.parse({ ...VALID, stats: { ...VALID.stats, hp: 0 } })
    ).toThrow();
  });

  it("rejects stat value out of range (101)", () => {
    expect(() =>
      CreatureAttributesSchema.parse({ ...VALID, stats: { ...VALID.stats, atk: 101 } })
    ).toThrow();
  });

  it("rejects non-integer stat", () => {
    expect(() =>
      CreatureAttributesSchema.parse({ ...VALID, stats: { ...VALID.stats, mp: 60.5 } })
    ).toThrow();
  });

  it("rejects missing top-level field", () => {
    const { trait: _trait, ...withoutTrait } = VALID;
    expect(() => CreatureAttributesSchema.parse(withoutTrait)).toThrow();
  });
});
