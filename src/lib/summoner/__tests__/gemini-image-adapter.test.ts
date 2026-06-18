import { describe, it, expect } from "vitest";
import { buildCreaturePrompt, jpegToTransparentPng } from "../gemini-image-adapter";
import type { CreatureAttributes } from "../../analyzer/types";
import * as jpeg from "jpeg-js";
import { PNG } from "pngjs";

const BASE_ATTRS: CreatureAttributes = {
  creature_archetype: "fox",
  creature_name: "Emberfang",
  complexity: 60,
  powers: ["fire", "shadow"],
  summary_description: "A lithe fox with flame-tipped tails wreathed in shadow.",
  confidence: "high",
};

describe("buildCreaturePrompt", () => {
  it("includes the summary_description at the start of the prompt", () => {
    const prompt = buildCreaturePrompt(BASE_ATTRS);
    expect(prompt).toContain(BASE_ATTRS.summary_description);
  });

  it("includes the creature_archetype in the prompt", () => {
    const prompt = buildCreaturePrompt(BASE_ATTRS);
    expect(prompt).toContain("fox creature");
  });

  it("derives colour palette from the dominant power (powers[0])", () => {
    const prompt = buildCreaturePrompt(BASE_ATTRS);
    expect(prompt).toContain("crimson and orange");
  });

  it("uses water palette when dominant power is water", () => {
    const attrs = { ...BASE_ATTRS, powers: ["water", "ice"] };
    const prompt = buildCreaturePrompt(attrs);
    expect(prompt).toContain("cyan and deep blue");
  });

  it("derives rarity modifier from complexity", () => {
    // complexity 60 → rarity 3 → "uncommon with subtle elemental markings"
    const prompt = buildCreaturePrompt(BASE_ATTRS);
    expect(prompt).toContain("uncommon with subtle elemental markings");
  });

  it("complexity 100 → rarity 5 → legendary modifier", () => {
    const prompt = buildCreaturePrompt({ ...BASE_ATTRS, complexity: 100 });
    expect(prompt).toContain("legendary");
  });

  it("complexity 0 → rarity 1 → plain modifier", () => {
    const prompt = buildCreaturePrompt({ ...BASE_ATTRS, complexity: 0 });
    expect(prompt).toContain("plain, simple form");
  });

  it("falls back to mystery palette for unknown power", () => {
    const attrs = { ...BASE_ATTRS, powers: ["unknownpower"] };
    const prompt = buildCreaturePrompt(attrs);
    expect(prompt).toContain("silver and grey");
  });
});

describe("jpegToTransparentPng", () => {
  function makeTestJpeg(pixels: { r: number; g: number; b: number }[][], w: number, h: number): string {
    const rgba = Buffer.alloc(w * h * 4);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        rgba[i]     = pixels[y][x].r;
        rgba[i + 1] = pixels[y][x].g;
        rgba[i + 2] = pixels[y][x].b;
        rgba[i + 3] = 255;
      }
    }
    const encoded = jpeg.encode({ data: rgba, width: w, height: h }, 100);
    return encoded.data.toString("base64");
  }

  function decodePng(pngBase64: string): Buffer {
    return PNG.sync.read(Buffer.from(pngBase64, "base64")).data as unknown as Buffer;
  }

  it("makes border-connected near-white pixels transparent", async () => {
    // 3x3: all white
    const white = { r: 255, g: 255, b: 255 };
    const pixels = [[white, white, white], [white, white, white], [white, white, white]];
    const jpegB64 = makeTestJpeg(pixels, 3, 3);
    const pngBase64 = await jpegToTransparentPng(jpegB64);
    const data = decodePng(pngBase64);
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
    const jpegB64 = makeTestJpeg(pixels, 3, 3);
    const pngBase64 = await jpegToTransparentPng(jpegB64);
    const data = decodePng(pngBase64);
    // centre pixel (1,1) should be opaque
    const centreAlpha = data[(1 * 3 + 1) * 4 + 3];
    expect(centreAlpha).toBeGreaterThan(0);
  });
});
