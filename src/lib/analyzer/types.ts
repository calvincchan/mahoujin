import { z } from "zod";

export const CreatureAttributesSchema = z.object({
  creature_archetype: z.string().min(1),
  creature_name: z.string().min(1),
  complexity: z.number().int().min(0).max(100),
  powers: z.array(z.string().min(1)).min(1).max(8),
  summary_description: z.string().min(1),
  confidence: z.enum(["high", "low"]),
});

export type CreatureAttributes = z.infer<typeof CreatureAttributesSchema>;

export type SavedCreature = CreatureAttributes & {
  /** UUID assigned at save time. */
  id: string;
  /** Player's final name — defaults to `creature_name`, overwritten on rename. */
  name: string;
  /** Rendered creature sprite (data URL). */
  imageUrl: string;
  /** ISO timestamp of when the creature was kept. */
  capturedAt: string;
};

export { UNKNOWN_CREATURE } from "./constants";
