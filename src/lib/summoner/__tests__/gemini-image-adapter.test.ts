import { describe, it, expect } from "vitest";
import { buildCreaturePrompt, jpegToTransparentPng } from "../gemini-image-adapter";
import { ARCHETYPE_REGISTRY } from "../../analyzer/archetypes";
import type { CreatureAttributes } from "../../analyzer/types";
import sharp from "sharp";

const BASE_ATTRS: CreatureAttributes = {
  archetype: "fox",
  element: "Fire",
  trait: "A lithe fox with flame-tipped tails that spiral upward like burning ribbons.",
  stats: { hp: 70, mp: 60, atk: 80, def: 50 },
  rarity: 3,
  confidence: "high",
};

describe("buildCreaturePrompt", () => {
  it("includes blueprint commonInspirations for the archetype", () => {
    const prompt = buildCreaturePrompt(BASE_ATTRS);
    const inspirations = ARCHETYPE_REGISTRY["fox"].commonInspirations;
    for (const name of inspirations) {
      expect(prompt).toContain(name);
    }
  });

  it("includes the sanitized trait at the start of the prompt", () => {
    const prompt = buildCreaturePrompt(BASE_ATTRS);
    expect(prompt).toContain(BASE_ATTRS.trait);
  });

  it("includes the blueprint name, not the raw archetype key", () => {
    const prompt = buildCreaturePrompt(BASE_ATTRS);
    expect(prompt).toContain("Fox creature");
  });

  it("works for the mysterious archetype with its own inspirations", () => {
    const attrs: CreatureAttributes = { ...BASE_ATTRS, archetype: "mysterious", element: "Stellar" };
    const prompt = buildCreaturePrompt(attrs);
    const inspirations = ARCHETYPE_REGISTRY["mysterious"].commonInspirations;
    for (const name of inspirations) {
      expect(prompt).toContain(name);
    }
  });

  it("caps an over-length trait at 600 chars", () => {
    const longTrait = "x".repeat(800);
    const prompt = buildCreaturePrompt({ ...BASE_ATTRS, trait: longTrait });
    expect(prompt).toContain("x".repeat(600));
    expect(prompt).not.toContain("x".repeat(601));
  });

  it("strips newlines from trait before placing it in the prompt", () => {
    const traitWithNewlines = "A fox\nwith bright\r\nflames.";
    const prompt = buildCreaturePrompt({ ...BASE_ATTRS, trait: traitWithNewlines });
    expect(prompt).not.toMatch(/[\r\n]/);
    expect(prompt).toContain("A fox");
  });
});

describe("jpegToTransparentPng", () => {
  async function makeTestJpeg(pixels: { r: number; g: number; b: number }[][], w: number, h: number): Promise<string> {
    const raw = Buffer.alloc(w * h * 3);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 3;
        raw[i] = pixels[y][x].r;
        raw[i + 1] = pixels[y][x].g;
        raw[i + 2] = pixels[y][x].b;
      }
    }
    const jpeg = await sharp(raw, { raw: { width: w, height: h, channels: 3 } }).jpeg({ quality: 100 }).toBuffer();
    return jpeg.toString("base64");
  }

  it("makes border-connected near-white pixels transparent", async () => {
    // 3x3: all white
    const white = { r: 255, g: 255, b: 255 };
    const pixels = [[white, white, white], [white, white, white], [white, white, white]];
    const jpeg = await makeTestJpeg(pixels, 3, 3);
    const pngBase64 = await jpegToTransparentPng(jpeg);
    const { data } = await sharp(Buffer.from(pngBase64, "base64")).raw().ensureAlpha().toBuffer({ resolveWithObject: true });
    // corners should be transparent (alpha 0)
    expect(data[3]).toBe(0);
  });

  it("preserves interior non-white pixels", async () => {
    // 3x3: white border, red centre
    const white = { r: 255, g: 255, b: 255 };
    const red = { r: 200, g: 50, b: 50 };
    const pixels = [
      [white, white, white],
      [white, red,   white],
      [white, white, white],
    ];
    const jpeg = await makeTestJpeg(pixels, 3, 3);
    const pngBase64 = await jpegToTransparentPng(jpeg);
    const { data } = await sharp(Buffer.from(pngBase64, "base64")).raw().ensureAlpha().toBuffer({ resolveWithObject: true });
    // centre pixel (1,1) should be opaque
    const centreAlpha = data[(1 * 3 + 1) * 4 + 3];
    expect(centreAlpha).toBeGreaterThan(0);
  });
});
