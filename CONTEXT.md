# Context — Mahoujin

A mobile-first web app that transforms hand-drawn magic-circle photos into summoned creatures.

## Glossary

### Mahoujin
The hand-drawn magic circle (magic seal) the player photographs. Input to the whole pipeline.

### Creature Attributes
The structured JSON the analysis stage produces from a Mahoujin photo: `creature_archetype` (open string), `creature_name`, `complexity` (0–100), `powers` (string array), `summary_description` (1 sentence), `confidence` (high/low). Defined by `CreatureAttributesSchema` (Zod). The contract passed from analysis to summoning.

### Creature Archetype
The type of animal or creature identified in the centre of the Mahoujin (e.g. "cat", "dragon", "fairy"). A free-form string — the LLM picks whatever label best describes the drawing. Not a closed enum.
_Avoid_: archetype blueprint, archetype registry (both removed).

### Creature Name
A short whimsical name (1–3 words, Title Case) the analysis LLM invents for this specific creature (e.g. "Emberfang", "Crystal Sprite"). Shown pre-filled in the name input on the summoning screen; the player may edit it before saving.
_Avoid_: name (ambiguous — qualify as Creature Name).

### Powers
An array of elemental symbol strings found anywhere in the Mahoujin drawing (e.g. `["fire", "fire", "water", "lightning"]`). Minimum 1, maximum 8. Duplicate entries signal dominance — a symbol that appears three times carries more weight than one that appears once. The LLM infers at least one power even when the drawing is sparse. The dominant power is the most-frequent entry, computed by frequency count at the summoning stage. Powers drive colour palette in image generation.
_Avoid_: element (the old single-type field); cardinal powers (direction no longer matters).

### Complexity
An integer from 0 to 100 representing how intricate the Mahoujin drawing is. Considers creature detail (clothing, accessories, extra wings) and secondary decorative markings. A bare doodle scores near 0; a dense, detailed drawing scores near 100. Not stored on `SavedCreature` — see Rarity.

### Rarity
A UI-only 1–5 star rating derived client-side from Complexity as `Math.ceil(complexity / 20)`. Not persisted; recomputed wherever stars are displayed.

### Summary Description
A single sentence blending the Creature Archetype with its dominant Powers, authored by the analysis LLM. Serves as the primary visual anchor for image generation.
_Avoid_: description (the old ~100-word field); trait.

### Summoning
The stage that turns Creature Attributes into a rendered creature sprite via the image-generation prompt. Derives dominant power by frequency count from Powers, maps it to a colour palette, and combines with Summary Description, Creature Archetype, and Complexity-derived rarity to build the final image prompt.

### Crystal Shelf
The player's collection of kept creatures, persisted in IndexedDB.

### Saved Creature
A kept creature persisted to the Crystal Shelf. Extends Creature Attributes with `id`, `imageUrl`, `capturedAt`, and `name` — the player's final name (defaults to `creature_name`, overwritten on rename).
