// PROTOTYPE — throwaway. See app/summoning/page.tsx + app/api/summon/route.ts
// Question: can Gemini image gen produce acceptable pixel art sprites?
// NOTE: Gemini image models (gemini-2.5-flash-image etc.) require a paid API plan.
//       On free tier, generateCreatureSprite returns null → SVG fallback renders instead.
import sharp from "sharp";
import { CreatureAttributes } from "../analyzer/types";
import { ARCHETYPE_REGISTRY } from "../analyzer/archetypes";

const TRAIT_MAX_LENGTH = 600;

function sanitizeTrait(trait: string): string {
  return trait.replace(/[\r\n\t\x00-\x1F\x7F]/g, " ").trim().slice(0, TRAIT_MAX_LENGTH);
}

// Border-connected flood-fill: only near-white pixels reachable from the image border
// become transparent. Interior white highlights (eyes, teeth, frost) are preserved.
export async function jpegToTransparentPng(jpegBase64: string): Promise<string> {
  const buf = Buffer.from(jpegBase64, "base64");
  const { data, info } = await sharp(buf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  const pixels = new Uint8ClampedArray(data);
  const visited = new Uint8Array(width * height);

  function isNearWhite(idx: number): boolean {
    return pixels[idx] > 230 && pixels[idx + 1] > 230 && pixels[idx + 2] > 230;
  }

  const queue: number[] = [];
  function enqueue(x: number, y: number) {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const pos = y * width + x;
    if (visited[pos]) return;
    if (!isNearWhite(pos * 4)) return;
    visited[pos] = 1;
    queue.push(x, y);
  }

  for (let x = 0; x < width; x++) { enqueue(x, 0); enqueue(x, height - 1); }
  for (let y = 1; y < height - 1; y++) { enqueue(0, y); enqueue(width - 1, y); }

  while (queue.length > 0) {
    const y = queue.pop()!;
    const x = queue.pop()!;
    enqueue(x + 1, y); enqueue(x - 1, y);
    enqueue(x, y + 1); enqueue(x, y - 1);
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pos = y * width + x;
      if (!visited[pos]) continue;
      const i = pos * 4;
      // 1px feather: check if any 4-neighbour is NOT keyed (solid pixel boundary)
      const hasEdge =
        (x > 0 && !visited[pos - 1]) ||
        (x < width - 1 && !visited[pos + 1]) ||
        (y > 0 && !visited[pos - width]) ||
        (y < height - 1 && !visited[pos + width]);
      pixels[i + 3] = hasEdge ? 128 : 0;
    }
  }

  const png = await sharp(Buffer.from(pixels), {
    raw: { width, height, channels: 4 },
  }).png().toBuffer();

  return png.toString("base64");
}

const ELEMENT_PALETTE: Record<string, string> = {
  Normal:    "warm beige and soft white",
  Fire:      "crimson and orange",
  Water:     "cyan and deep blue",
  Grass:     "leaf green and golden yellow",
  Electric:  "bright yellow and white sparks",
  Ice:       "pale blue and crystal white",
  Fighting:  "deep red and earthy brown",
  Poison:    "toxic purple and acid green",
  Ground:    "sandy brown and terracotta",
  Flying:    "sky blue and cloud white",
  Psychic:   "hot pink and lavender",
  Bug:       "lime green and carapace brown",
  Rock:      "granite grey and sandstone",
  Ghost:     "dark indigo and pale violet",
  Dragon:    "midnight blue and metallic gold",
  Dark:      "charcoal black and deep crimson",
  Steel:     "silver and metallic blue",
  Fairy:     "rose pink and iridescent white",
  Stellar:   "prismatic rainbow and starlight silver",
};

const RARITY_MODIFIER: Record<number, string> = {
  1: "plain, simple",
  2: "common",
  3: "uncommon with subtle markings",
  4: "rare with glowing accents",
  5: "legendary with golden aura and mystical effects",
};

// Art direction — swap this const to experiment with different visual styles
// (e.g. anime/chibi, watercolour) without touching the content/data path.
const ART_STYLE_PROMPT =
  "Modern isometric 16-bit pixel art sprite, highly detailed blocky pixel art, " +
  "crisp pixel edges, rich shading and highlights, nostalgic Pokémon-style sprite";

export function buildCreaturePrompt(attrs: CreatureAttributes): string {
  const palette = ELEMENT_PALETTE[attrs.element] ?? "silver and grey";
  const rarityMod = RARITY_MODIFIER[attrs.rarity] ?? "common";
  const blueprint = ARCHETYPE_REGISTRY[attrs.archetype];
  const inspirations = blueprint.commonInspirations.join(", ");
  const trait = sanitizeTrait(attrs.trait);

  return [
    `${trait}`,
    `${ART_STYLE_PROMPT},`,
    `${blueprint.name} creature,`,
    `${attrs.element} elemental with ${palette} color palette,`,
    `inspired by ${inspirations},`,
    `${rarityMod},`,
    `intricate body markings, expressive eyes, dynamic silhouette,`,
    `full body visible, facing left,`,
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
  Normal:   ["#a8a878", "#c8c8a0"],
  Fire:     ["#dc2626", "#f97316"],
  Water:    ["#0284c7", "#22d3ee"],
  Grass:    ["#16a34a", "#ca8a04"],
  Electric: ["#eab308", "#fef9c3"],
  Ice:      ["#7dd3fc", "#e0f2fe"],
  Fighting: ["#b91c1c", "#78350f"],
  Poison:   ["#7e22ce", "#65a30d"],
  Ground:   ["#b45309", "#c2410c"],
  Flying:   ["#38bdf8", "#e0f2fe"],
  Psychic:  ["#ec4899", "#c084fc"],
  Bug:      ["#65a30d", "#a16207"],
  Rock:     ["#78716c", "#d6d3d1"],
  Ghost:    ["#4338ca", "#c4b5fd"],
  Dragon:   ["#1e3a8a", "#d97706"],
  Dark:     ["#1c1917", "#991b1b"],
  Steel:    ["#94a3b8", "#1d4ed8"],
  Fairy:    ["#f472b6", "#f0fdf4"],
  Stellar:  ["#6d28d9", "#e0f2fe"],
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
