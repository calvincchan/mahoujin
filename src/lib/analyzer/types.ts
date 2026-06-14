import { z } from "zod";

export const CreatureAttributesSchema = z.object({
  archetype: z.string(),
  element: z.enum(["fire", "water", "earth", "wind", "void", "unknown"]),
  trait: z.string(),
  stats: z.object({
    hp: z.number().int().min(1).max(100),
    mp: z.number().int().min(1).max(100),
    atk: z.number().int().min(1).max(100),
    def: z.number().int().min(1).max(100),
  }),
  rarity: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]),
  confidence: z.enum(["high", "low"]),
});

export type CreatureAttributes = z.infer<typeof CreatureAttributesSchema>;

export const MYSTERIOUS_CREATURE: CreatureAttributes = {
  archetype: "mysterious",
  element: "void",
  trait: "enigmatic",
  stats: { hp: 85, mp: 90, atk: 75, def: 80 },
  rarity: 5,
  confidence: "low",
};
