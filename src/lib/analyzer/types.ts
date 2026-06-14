import { z } from "zod";

export const CreatureAttributesSchema = z.object({
  archetype: z.string(),
  element: z.string(),
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

export { MYSTERIOUS_CREATURE } from "./constants";
