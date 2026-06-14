// PROTOTYPE — throwaway. See app/summoning/page.tsx + app/api/summon/route.ts
// Question: can Gemini image gen produce acceptable pixel art sprites?
// NOTE: Gemini image models (gemini-2.5-flash-image etc.) require a paid API plan.
//       On free tier, generateCreatureSprite returns null → SVG fallback renders instead.
import sharp from "sharp";
import { CreatureAttributes } from "../analyzer/types";

async function jpegToTransparentPng(jpegBase64: string): Promise<string> {
  const buf = Buffer.from(jpegBase64, "base64");
  const { data, info } = await sharp(buf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = new Uint8ClampedArray(data);
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
    if (r > 240 && g > 240 && b > 240) pixels[i + 3] = 0;
  }

  const png = await sharp(Buffer.from(pixels), {
    raw: { width: info.width, height: info.height, channels: 4 },
  }).png().toBuffer();

  return png.toString("base64");
}

const ELEMENT_PALETTE: Record<string, string> = {
  fire: "crimson and orange",
  water: "cyan and deep blue",
  earth: "forest green and brown",
  wind: "pale blue and white",
  void: "deep purple and black",
  unknown: "silver and grey",
};

const RARITY_MODIFIER: Record<number, string> = {
  1: "plain, simple",
  2: "common",
  3: "uncommon with subtle markings",
  4: "rare with glowing accents",
  5: "legendary with golden aura and mystical effects",
};

export function buildCreaturePrompt(attrs: CreatureAttributes): string {
  const palette = ELEMENT_PALETTE[attrs.element] ?? "silver and grey";
  const rarityMod = RARITY_MODIFIER[attrs.rarity] ?? "common";

  return [
    `Modern isometric 16-bit pixel art sprite,`,
    `${attrs.archetype} creature,`,
    `${attrs.element} elemental with ${palette} color palette,`,
    `${attrs.trait} expression and personality,`,
    `${rarityMod},`,
    `highly detailed blocky pixel art, crisp pixel edges, rich shading and highlights,`,
    `intricate body markings, expressive eyes, dynamic silhouette,`,
    `nostalgic Pokémon-style sprite, full body visible, facing left,`,
    `centered on plain white background, no text, no watermark, no border`,
  ].join(" ");
}

interface InteractionStep {
  type: string;
  content?: Array<{ type: string; data?: string; text?: string; mime_type?: string }>;
}

interface InteractionResponse {
  steps?: InteractionStep[];
}

// Uses the interactions API (v1beta) which supports image_size param.
// Model gemini-3.1-flash-image supports 512px output.
export async function generateCreatureSprite(
  attrs: CreatureAttributes
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const prompt = buildCreaturePrompt(attrs);

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/interactions?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Revision": "2026-05-20",
      },
      body: JSON.stringify({
        model: "gemini-3.1-flash-image",
        input: prompt,
        response_format: {
          type: "image",
          mime_type: "image/jpeg",
          aspect_ratio: "1:1",
          image_size: "512",
        },
      }),
    }
  );

  if (!res.ok) return null;

  const data = (await res.json()) as InteractionResponse;
  for (const step of data.steps ?? []) {
    if (step.type === "model_output") {
      for (const block of step.content ?? []) {
        if (block.type === "image" && block.data) {
          const pngBase64 = await jpegToTransparentPng(block.data);
          return `data:image/png;base64,${pngBase64}`;
        }
      }
    }
  }

  return null;
}

// SVG placeholder — renders when image gen quota is unavailable (free tier).
// Used by /api/summon as fallback so the UI flow is testable without a paid key.
const ELEMENT_SVG_COLOR: Record<string, [string, string]> = {
  fire:    ["#dc2626", "#f97316"],
  water:   ["#0284c7", "#22d3ee"],
  earth:   ["#15803d", "#a16207"],
  wind:    ["#bae6fd", "#e0f2fe"],
  void:    ["#7e22ce", "#1e1b4b"],
  unknown: ["#94a3b8", "#cbd5e1"],
};

export function buildFallbackSvg(attrs: CreatureAttributes): string {
  const [c1, c2] = ELEMENT_SVG_COLOR[attrs.element] ?? ["#6b7280", "#d1d5db"];
  const stars = attrs.rarity;
  const emoji = attrs.archetype.charAt(0).toUpperCase();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${c2}" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="${c1}" stop-opacity="0.1"/>
    </radialGradient>
  </defs>
  <rect width="200" height="200" fill="white"/>
  <circle cx="100" cy="100" r="80" fill="url(#bg)" stroke="${c1}" stroke-width="2" opacity="0.8"/>
  <text x="100" y="115" text-anchor="middle" font-size="64" font-family="monospace">${emoji}</text>
  <text x="100" y="155" text-anchor="middle" font-size="12" fill="${c1}" font-family="monospace" font-weight="bold">${attrs.archetype.toUpperCase()}</text>
  <text x="100" y="175" text-anchor="middle" font-size="14" fill="#d97706" font-family="monospace">${"★".repeat(stars)}${"☆".repeat(5 - stars)}</text>
  <text x="100" y="192" text-anchor="middle" font-size="9" fill="#9ca3af" font-family="monospace">PROTOTYPE PLACEHOLDER</text>
</svg>`;

  const b64 = Buffer.from(svg).toString("base64");
  return `data:image/svg+xml;base64,${b64}`;
}
