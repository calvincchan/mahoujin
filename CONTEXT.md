# Context — Mahoujin

A mobile-first web app that transforms hand-drawn magic-circle photos into summoned creatures.

## Glossary

### Mahoujin
The hand-drawn magic circle (magic seal) the player photographs. Input to the whole pipeline.

### Creature Attributes
The structured JSON the analysis stage produces from a Mahoujin photo: `archetype`, `element`, `trait`, `stats` (hp/mp/atk/def), `rarity` (1–5), `confidence` (high/low). Defined by `CreatureAttributesSchema` (Zod). The contract passed from analysis to summoning.

### Archetype
The creature's body blueprint (e.g. `fox`, `serpent`, `turtle`). One of a fixed set. The LLM picks one during analysis.

### Element
The creature's elemental type (19 Pokémon-style types: Fire, Water, … Stellar). Drives colour palette in image gen.

### Trait
A 2–3 sentence creative visual description of *this* creature's distinctive features and elemental variant, authored by the analysis LLM. Leads the image-generation prompt as the primary visual anchor. Does **not** carry named-Pokémon references — those are owned by the Archetype Registry's `commonInspirations`, injected deterministically into the image prompt.

### Archetype Registry
`src/lib/analyzer/archetypes.ts` — a curated table mapping each Archetype to a description, evolutionary pattern, and `commonInspirations` (named Pokémon used as design nudges). Currently **not wired into any prompt** — dead code.

### Summoning
The stage that turns Creature Attributes into a rendered creature sprite via the image-generation prompt.
