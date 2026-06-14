# 1. Archetype is a closed enum, not free text

Date: 2026-06-14

## Status

Accepted

## Context

The analysis stage produces Creature Attributes, in which `archetype` was a free
string. The system prompt explicitly licensed the LLM to "choose the closest
match or use a descriptive word", so `archetype` could be any token.

We decided to inject the Archetype Registry's `commonInspirations` deterministically
into the image-generation prompt (keyed by `archetype`). A deterministic lookup
requires `archetype` to always be one of the registry's keys; a free string makes
the lookup partial and silently drops the design nudges for off-registry values.

The `MYSTERIOUS_CREATURE` fallback also used `archetype: "mysterious"`, which is
not a body blueprint.

## Decision

`archetype` becomes a closed enum of the 16 `ArchetypeBlueprint` keys **plus**
`mysterious` (added as a 17th registry entry). The enum is enforced in three places
that must stay in sync: the Gemini `responseSchema`, the Zod `CreatureAttributesSchema`,
and the analysis system prompt (the "descriptive word" license is removed).

## Consequences

- The registry lookup in `buildCreaturePrompt` is total — every creature gets curated
  design nudges, including the high-traffic `mysterious` path.
- `archetype` validation drift is closed: Gemini can no longer emit an unknown body type.
- Changing the contract later (adding/removing a blueprint) now means editing three
  synchronized definitions — a deliberate cost paid for determinism.
- `element` remains a free string for now; this ADR intentionally does not extend the
  enum treatment to it. Element validation is a separate, future decision.
- Trade-off accepted: the LLM loses freedom to coin novel archetypes. We judged
  reliable, curated design language more valuable than open-ended creativity here.
