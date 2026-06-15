import { describe, it, expect } from "vitest";
import { CreatureAttributesSchema, ELEMENT_KEYS } from "../types";

const VALID = {
  archetype: "fox",
  element: "Fire",
  creatureName: "Emberfang",
  description: "A lithe fox with flame-tipped tails that spiral upward like burning ribbons.",
  stats: { hp: 80, mp: 60, atk: 90, def: 70 },
  rarity: 3,
  confidence: "high",
};

describe("CreatureAttributesSchema", () => {
  it("accepts valid payload", () => {
    expect(() => CreatureAttributesSchema.parse(VALID)).not.toThrow();
  });

  it("rejects unknown element", () => {
    expect(() =>
      CreatureAttributesSchema.parse({ ...VALID, element: "Lightning" })
    ).toThrow();
  });

  it("accepts all 19 valid elements", () => {
    for (const el of ELEMENT_KEYS) {
      expect(() =>
        CreatureAttributesSchema.parse({ ...VALID, element: el })
      ).not.toThrow();
    }
  });

  it("rejects unknown archetype", () => {
    expect(() =>
      CreatureAttributesSchema.parse({ ...VALID, archetype: "dragon" })
    ).toThrow();
  });

  it("accepts mysterious archetype", () => {
    expect(() =>
      CreatureAttributesSchema.parse({ ...VALID, archetype: "mysterious" })
    ).not.toThrow();
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

  it("rejects missing top-level field (description)", () => {
    const { description: _description, ...withoutDescription } = VALID;
    expect(() => CreatureAttributesSchema.parse(withoutDescription)).toThrow();
  });

  it("rejects missing top-level field (creatureName)", () => {
    const { creatureName: _creatureName, ...withoutCreatureName } = VALID;
    expect(() => CreatureAttributesSchema.parse(withoutCreatureName)).toThrow();
  });
});
