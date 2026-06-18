import { describe, it, expect } from "vitest";
import { CreatureAttributesSchema } from "../types";

const VALID = {
  creature_archetype: "fox",
  creature_name: "Emberfang",
  complexity: 60,
  powers: ["fire", "shadow"],
  summary_description: "A lithe fox with flame-tipped tails wreathed in shadow.",
  confidence: "high",
};

describe("CreatureAttributesSchema", () => {
  it("accepts valid payload", () => {
    expect(() => CreatureAttributesSchema.parse(VALID)).not.toThrow();
  });

  it("accepts single-power payload", () => {
    expect(() => CreatureAttributesSchema.parse({ ...VALID, powers: ["fire"] })).not.toThrow();
  });

  it("accepts 8-power payload", () => {
    const powers = ["fire", "fire", "fire", "water", "water", "ice", "lightning", "shadow"];
    expect(() => CreatureAttributesSchema.parse({ ...VALID, powers })).not.toThrow();
  });

  it("accepts powers with duplicate entries (dominance)", () => {
    expect(() =>
      CreatureAttributesSchema.parse({ ...VALID, powers: ["fire", "fire", "fire", "water"] })
    ).not.toThrow();
  });

  it("rejects empty powers array", () => {
    expect(() => CreatureAttributesSchema.parse({ ...VALID, powers: [] })).toThrow();
  });

  it("rejects powers array with more than 8 entries", () => {
    const powers = ["a", "b", "c", "d", "e", "f", "g", "h", "i"];
    expect(() => CreatureAttributesSchema.parse({ ...VALID, powers })).toThrow();
  });

  it("rejects complexity below 0", () => {
    expect(() => CreatureAttributesSchema.parse({ ...VALID, complexity: -1 })).toThrow();
  });

  it("rejects complexity above 100", () => {
    expect(() => CreatureAttributesSchema.parse({ ...VALID, complexity: 101 })).toThrow();
  });

  it("rejects non-integer complexity", () => {
    expect(() => CreatureAttributesSchema.parse({ ...VALID, complexity: 60.5 })).toThrow();
  });

  it("rejects invalid confidence value", () => {
    expect(() =>
      CreatureAttributesSchema.parse({ ...VALID, confidence: "medium" })
    ).toThrow();
  });

  it("accepts confidence: low", () => {
    expect(() =>
      CreatureAttributesSchema.parse({ ...VALID, confidence: "low" })
    ).not.toThrow();
  });

  it("rejects missing powers field", () => {
    const { powers: _powers, ...without } = VALID;
    expect(() => CreatureAttributesSchema.parse(without)).toThrow();
  });

  it("rejects missing creature_archetype", () => {
    const { creature_archetype: _a, ...without } = VALID;
    expect(() => CreatureAttributesSchema.parse(without)).toThrow();
  });

  it("rejects missing creature_name", () => {
    const { creature_name: _n, ...without } = VALID;
    expect(() => CreatureAttributesSchema.parse(without)).toThrow();
  });

  it("rejects missing summary_description", () => {
    const { summary_description: _d, ...without } = VALID;
    expect(() => CreatureAttributesSchema.parse(without)).toThrow();
  });
});

describe("rarity derivation (Math.max(1, Math.ceil(complexity / 20)))", () => {
  const rarity = (complexity: number) => Math.max(1, Math.ceil(complexity / 20));

  it("complexity 0 → rarity 1", () => expect(rarity(0)).toBe(1));
  it("complexity 1 → rarity 1", () => expect(rarity(1)).toBe(1));
  it("complexity 20 → rarity 1", () => expect(rarity(20)).toBe(1));
  it("complexity 21 → rarity 2", () => expect(rarity(21)).toBe(2));
  it("complexity 40 → rarity 2", () => expect(rarity(40)).toBe(2));
  it("complexity 41 → rarity 3", () => expect(rarity(41)).toBe(3));
  it("complexity 80 → rarity 4", () => expect(rarity(80)).toBe(4));
  it("complexity 81 → rarity 5", () => expect(rarity(81)).toBe(5));
  it("complexity 100 → rarity 5", () => expect(rarity(100)).toBe(5));
});
