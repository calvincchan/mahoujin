import * as jpeg from "jpeg-js";
import { PNG } from "pngjs";
import { CreatureAttributes } from "../analyzer/types";

const NEAR_WHITE_THRESHOLD = 242;
const EDGE_FEATHER_ALPHA = 128;
const KEYED_ALPHA = 0;

// Border-connected flood-fill: only near-white pixels reachable from the image border
// become transparent. Interior white highlights (eyes, teeth, frost) are preserved.
export async function jpegToTransparentPng(jpegBase64: string): Promise<string> {
  const buf = Buffer.from(jpegBase64, "base64");
  const raw = jpeg.decode(buf, { useTArray: true });
  const { width, height } = raw;
  // jpeg-js gives RGBA (4 channels); use directly but ensure alpha=255
  const pixels = new Uint8ClampedArray(raw.data);
  for (let i = 3; i < pixels.length; i += 4) pixels[i] = 255;
  const visited = new Uint8Array(width * height);

  function isNearWhite(idx: number): boolean {
    return pixels[idx] > NEAR_WHITE_THRESHOLD && pixels[idx + 1] > NEAR_WHITE_THRESHOLD && pixels[idx + 2] > NEAR_WHITE_THRESHOLD;
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
      pixels[i + 3] = hasEdge ? EDGE_FEATHER_ALPHA : KEYED_ALPHA;
    }
  }

  const png = new PNG({ width, height });
  png.data = Buffer.from(pixels);
  const pngBuf = await new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    png.pack()
      .on("data", (c: Buffer) => chunks.push(c))
      .on("end", () => resolve(Buffer.concat(chunks)))
      .on("error", reject);
  });

  return pngBuf.toString("base64");
}

function computeDominantPower(powers: string[]): string {
  const freq: Record<string, number> = {};
  for (const p of powers) {
    const key = p.toLowerCase();
    freq[key] = (freq[key] ?? 0) + 1;
  }
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
}

function computeSecondaryPowers(powers: string[], dominant: string): string[] {
  const seen = new Set<string>([dominant]);
  const result: string[] = [];
  for (const p of powers) {
    const key = p.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(key);
      if (result.length === 2) break;
    }
  }
  return result;
}

const POWER_PALETTE: Record<string, string> = {
  fire:      "crimson and orange",
  flame:     "crimson and orange",
  water:     "cyan and deep blue",
  lightning: "bright yellow and white sparks",
  electric:  "bright yellow and white sparks",
  ice:       "pale blue and crystal white",
  shadow:    "charcoal black and deep crimson",
  dark:      "charcoal black and deep crimson",
  light:     "rose pink and iridescent white",
  wind:      "sky blue and cloud white",
  air:       "sky blue and cloud white",
  nature:    "leaf green and golden yellow",
  earth:     "sandy brown and terracotta",
  ground:    "sandy brown and terracotta",
  mystery:   "prismatic rainbow and starlight silver",
  ghost:     "dark indigo and pale violet",
  psychic:   "hot pink and lavender",
  poison:    "toxic purple and acid green",
  rock:      "granite grey and sandstone",
};

const RARITY_MODIFIER: Record<number, string> = {
  1: "plain, simple form",
  2: "common, unremarkable",
  3: "uncommon with subtle elemental markings",
  4: "rare, intricate patterns and glowing accents",
  5: "legendary, extraordinarily detailed with ancient runes and complex markings",
};

// Art direction — swap this const to experiment with different visual styles
// (e.g. anime/chibi, watercolour) without touching the content/data path.
const ART_STYLE_PROMPT =
  "Modern isometric 16-bit pixel art sprite, highly detailed blocky pixel art, " +
  "crisp pixel edges, rich shading and highlights, nostalgic game-style sprite, " +
  "no outer glow, no bloom, no aura halo around the creature.";

export function buildCreaturePrompt(attrs: CreatureAttributes): string {
  const dominant = computeDominantPower(attrs.powers);
  const secondaries = computeSecondaryPowers(attrs.powers, dominant);
  const palette = POWER_PALETTE[dominant] ?? "silver and grey";
  const rarity = Math.max(1, Math.ceil(attrs.complexity / 20));
  const rarityMod = RARITY_MODIFIER[rarity] ?? "common";
  const description = attrs.summary_description.slice(0, 500);
  const paletteClause = secondaries.length
    ? `${palette} color palette, with hints of ${secondaries.join(" and ")}.`
    : `${palette} color palette.`;

  return [
    description,
    `${attrs.creature_archetype}, full body visible, facing left, centered on plain white background, no text, no watermark, no border.`,
    paletteClause,
    `${rarityMod}.`,
    ART_STYLE_PROMPT,
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

  console.log(prompt);

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
const POWER_SVG_COLOR: Record<string, [string, string]> = {
  fire:      ["#dc2626", "#f97316"],
  flame:     ["#dc2626", "#f97316"],
  water:     ["#0284c7", "#22d3ee"],
  lightning: ["#eab308", "#fef9c3"],
  electric:  ["#eab308", "#fef9c3"],
  ice:       ["#7dd3fc", "#e0f2fe"],
  shadow:    ["#1c1917", "#991b1b"],
  dark:      ["#1c1917", "#991b1b"],
  light:     ["#f472b6", "#f0fdf4"],
  wind:      ["#38bdf8", "#e0f2fe"],
  nature:    ["#16a34a", "#ca8a04"],
  earth:     ["#b45309", "#c2410c"],
  mystery:   ["#6d28d9", "#e0f2fe"],
  ghost:     ["#4338ca", "#c4b5fd"],
  psychic:   ["#ec4899", "#c084fc"],
};

export function buildFallbackSvg(attrs: CreatureAttributes): string {
  const dominant = computeDominantPower(attrs.powers);
  const [c1, c2] = POWER_SVG_COLOR[dominant] ?? ["#6b7280", "#d1d5db"];
  const rarity = Math.max(1, Math.ceil(attrs.complexity / 20));
  const emoji = attrs.creature_archetype.charAt(0).toUpperCase();

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
  <text x="100" y="155" text-anchor="middle" font-size="12" fill="${c1}" font-family="monospace" font-weight="bold">${attrs.creature_archetype.toUpperCase()}</text>
  <text x="100" y="178" text-anchor="middle" font-size="14" fill="#d97706" font-family="monospace">${"★".repeat(rarity)}${"☆".repeat(5 - rarity)}</text>
</svg>`;

  const b64 = Buffer.from(svg).toString("base64");
  return `data:image/svg+xml;base64,${b64}`;
}
