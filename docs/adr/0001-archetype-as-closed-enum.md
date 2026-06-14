# ADR-0001: Archetype as a Closed Enum

**Status:** Accepted  
**Date:** 2026-06-14

## Context

`archetype` was a free string. The Archetype Registry held curated blueprints with `commonInspirations` (named Pokémon used as design references), but the registry was never consulted during image generation. The analysis LLM named Pokémon inside the `trait` field inconsistently, sometimes contradicting the archetype. The `mysterious` fallback had no registry entry and required special-casing.

## Decision

`archetype` is a closed enum of 17 values — the 16 `ArchetypeBlueprint` keys plus `mysterious`. Enforced in three synchronized places:

1. **Gemini `responseSchema`** — `enum` field listing all valid keys
2. **Zod `CreatureAttributesSchema`** — `z.enum(ARCHETYPE_BLUEPRINT_KEYS)`
3. **Analysis system prompt** — explicit list; "use a descriptive word" licence removed

`mysterious` is a real registry entry (Stellar/cosmic blueprint). The prompt builder looks up the registry deterministically; no branch needed for the fallback path.

The `trait` field is a pure visual description of the individual creature. Named Pokémon references are removed from `TRAIT_INSTRUCTIONS`; the registry owns all design references.

## Consequences

- Every valid `archetype` value resolves to a registry entry — the lookup is total.
- An off-enum archetype fails Zod parse and routes to the existing mysterious fallback.
- Three definitions must be kept in sync: `ARCHETYPE_BLUEPRINT_KEYS` (source of truth), the Gemini schema, and the system prompt.
- `element` remains a free string (out of scope per issue #17).
