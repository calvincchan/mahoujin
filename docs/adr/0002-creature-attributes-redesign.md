# ADR-0002: Creature Attributes Redesign — Sampled Inspirations, Closed Element, Derived Registry Fields

**Status:** Accepted
**Date:** 2026-06-14
**Amends:** ADR-0001 (closes the two items it deferred)

## Context

A revised design proposed merging Pokémon-style fields directly into `CreatureAttributes`: per-creature `category`, `description`, and LLM-generated `commonInspirations`, plus a creature name and a closed `element` type. Taken literally, that would have:

- let the analysis LLM freely name 2–4 Pokémon per summon (for randomness/surprise), and
- duplicated static registry data (`category`, `commonInspirations`) onto every creature record.

The motivation was delight through randomness. But `commonInspirations` is an **invisible** image-prompt nudge — the player never sees it. Letting the LLM author it reintroduces exactly the failure ADR-0001 killed: off-archetype references (a fox body nudged toward turtle Pokémon) that confuse the image model. The visible surprise already comes from the free-text `description`, the `element` × `archetype` palette combinations, and the creature name.

## Decision

`CreatureAttributes` (the analysis → summon contract) is:

```ts
{
  archetype: ArchetypeBlueprint;   // closed enum (ADR-0001)
  element: Element;                // closed 19-value enum (newly closed here)
  creatureName: string;            // LLM-suggested given name
  description: string;             // ~100-word visual description (renamed from `trait`)
  stats: { hp; mp; atk; def };
  rarity: 1 | 2 | 3 | 4 | 5;
  confidence: "high" | "low";
}
```

- **Inspirations stay registry-owned and are sampled, not generated.** Each Archetype's `commonInspirations` pool grows to 8–12 entries; at summon time 1–2 are randomly sampled into the image prompt. This delivers per-summon variety while every pick stays coherent with the body. The LLM never names a Pokémon.
- **`category` and `commonInspirations` are derived, not on the wire.** They are looked up from `ARCHETYPE_REGISTRY[archetype]`. `category` is denormalized onto `SavedCreature` at save time so the Crystal Shelf needn't re-derive.
- **`element` is closed to a 19-value enum** (`Normal … Stellar`), synchronized across `ELEMENT_KEYS`, the Zod schema, and the Gemini `responseSchema` — the same three-way sync as `archetype`. This closes ADR-0001's "element remains a free string" deferral. An off-enum element fails Zod and routes to the Mysterious fallback.
- **`trait` is renamed `description`** (~100 words, fed directly to the image prompt). Personality folds into the prose; there is no separate personality field.
- **`rarity` and `confidence` are retained.** `confidence: "low"` continues to drive the Mysterious path; `rarity` drives the stars UI and the image prompt's rarity modifier.
- **`evolutionaryPattern` is dropped** from the registry — unused.

## Consequences

- Randomness lives where the player sees it (`description`, element combos, name) and where it can't break coherence (sampled-not-generated inspirations).
- Two synchronized enums now exist (`ARCHETYPE_BLUEPRINT_KEYS`, `ELEMENT_KEYS`), each mirrored in Zod + Gemini schema + system prompt.
- Two names coexist: `creatureName` (LLM original, immutable) and `SavedCreature.name` (player's final, editable on Keep).
- ADR-0001 stands; this ADR only closes its two deferrals (element-as-enum, and confirming the registry — not the LLM — owns design references).
