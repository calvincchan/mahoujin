# ADR-0003: Hosted Gemini Image Generation, Pixel-Art Style via a Single Const

**Status:** Accepted
**Date:** 2026-06-14

## Context

The original PRD specified image generation via a **local ComfyUI** REST API (SDXL/SD 1.5, anime/chibi style) running on the developer's M1 Mac. In practice a throwaway prototype using the **hosted Gemini image API** (`gemini-3.1-flash-image`, interactions endpoint) was built instead, and its **16-bit pixel-art** output was preferred over the planned anime/chibi look.

Two divergences from the PRD needed resolving: which image-gen backend ships, and which art style ships.

## Decision

**Backend: hosted Gemini image API, not local ComfyUI.** `generateCreatureSprite` calls Gemini server-side through a Next.js route, post-processes to a transparent PNG, and returns a data URL. ComfyUI and other self-hosted models are dropped for v1.

**Style: 16-bit pixel art, centralized in `ART_STYLE_PROMPT`.** The pixel-art descriptors live in one const in `gemini-image-adapter.ts`, separate from the content/data path of `buildCreaturePrompt`. Swapping styles later (anime/chibi, watercolour) is a one-const edit, no data-path changes.

## Consequences

- **Image generation requires a paid Gemini plan.** On the free tier `generateCreatureSprite` returns `null` and `buildFallbackSvg` renders an SVG placeholder — the flow stays demoable without a key, but real sprites need billing. Analysis (Gemini vision) still runs on the free tier.
- No local GPU / ComfyUI setup; deployable to Vercel with only an API key. Trade-off: per-image cost and an external dependency instead of free local compute.
- The PRD's anime/chibi intent is superseded by pixel art; `ART_STYLE_PROMPT` keeps that reversible without touching contracts.
- The adapter's "PROTOTYPE — throwaway" header is now obsolete — this is the chosen path. (Header to be cleared during the ADR-0002 migration.)
