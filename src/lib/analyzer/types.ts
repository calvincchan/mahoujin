import { z } from "zod";
import { ARCHETYPE_BLUEPRINT_KEYS, ArchetypeCategory } from "./archetypes";

export const ELEMENT_KEYS = [
  "Normal",
  "Fire",
  "Water",
  "Grass",
  "Electric",
  "Ice",
  "Fighting",
  "Poison",
  "Ground",
  "Flying",
  "Psychic",
  "Bug",
  "Rock",
  "Ghost",
  "Dragon",
  "Dark",
  "Steel",
  "Fairy",
  "Stellar",
] as const;

export type Element = (typeof ELEMENT_KEYS)[number];

export const CreatureAttributesSchema = z.object({
  archetype: z.enum(ARCHETYPE_BLUEPRINT_KEYS),
  element: z.enum(ELEMENT_KEYS),
  creatureName: z.string(),
  description: z.string(),
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

export type SavedCreature = CreatureAttributes & {
  /** UUID assigned at save time. */
  id: string;
  /** Player's final name — defaults to `creatureName`, overwritten on rename. */
  name: string;
  /** Denormalized from the Archetype Registry at save time. */
  category: ArchetypeCategory;
  /** Rendered creature sprite (data URL). */
  imageUrl: string;
  /** ISO timestamp of when the creature was kept. */
  capturedAt: string;
};

export { MYSTERIOUS_CREATURE } from "./constants";
