import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGenerateContent = vi.fn();

vi.mock("@google/generative-ai", () => {
  function GoogleGenerativeAI() {
    return {
      getGenerativeModel: () => ({ generateContent: mockGenerateContent }),
    };
  }
  return {
    GoogleGenerativeAI,
    SchemaType: { OBJECT: "OBJECT", STRING: "STRING", INTEGER: "INTEGER" },
  };
});

import { analyzeDrawing } from "../gemini-adapter";

const VALID_RESPONSE = {
  archetype: "fox",
  element: "Fire",
  trait: "fierce",
  stats: { hp: 80, mp: 60, atk: 90, def: 70 },
  rarity: 3,
  confidence: "high",
};

function mockGeminiText(text: string) {
  mockGenerateContent.mockResolvedValue({
    response: { text: () => text },
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  process.env.GEMINI_API_KEY = "test-key";
});

describe("analyzeDrawing", () => {
  it("returns valid CreatureAttributes on successful Gemini response", async () => {
    mockGeminiText(JSON.stringify(VALID_RESPONSE));

    const result = await analyzeDrawing("base64imagedata");

    expect(result).toMatchObject({
      archetype: "fox",
      element: "Fire",
      trait: "fierce",
      stats: { hp: 80, mp: 60, atk: 90, def: 70 },
      rarity: 3,
      confidence: "high",
    });
  });

  it("routes unknown archetype to mysterious fallback", async () => {
    mockGeminiText(JSON.stringify({ ...VALID_RESPONSE, archetype: "dragon" }));

    const result = await analyzeDrawing("base64imagedata");

    expect(result.archetype).toBe("mysterious");
  });

  it("returns mysterious creature when confidence is low", async () => {
    mockGeminiText(JSON.stringify({ ...VALID_RESPONSE, confidence: "low" }));

    const result = await analyzeDrawing("base64imagedata");

    expect(result.archetype).toBe("mysterious");
    expect(result.confidence).toBe("low");
    expect([4, 5]).toContain(result.rarity);
  });

  it("returns mysterious creature when Gemini returns malformed JSON", async () => {
    mockGeminiText("not valid json at all %%%");

    const result = await analyzeDrawing("base64imagedata");

    expect(result.archetype).toBe("mysterious");
  });

  it("returns mysterious creature when GEMINI_API_KEY is missing", async () => {
    delete process.env.GEMINI_API_KEY;

    const result = await analyzeDrawing("base64imagedata");

    expect(result.archetype).toBe("mysterious");
  });

  it("returns mysterious creature when Gemini throws a network error", async () => {
    mockGenerateContent.mockRejectedValue(new Error("network failure"));

    const result = await analyzeDrawing("base64imagedata");

    expect(result.archetype).toBe("mysterious");
  });

  it("returns mysterious creature when Gemini returns valid JSON that fails Zod schema", async () => {
    mockGeminiText(JSON.stringify({ ...VALID_RESPONSE, element: "lightning", rarity: 99 }));

    const result = await analyzeDrawing("base64imagedata");

    expect(result.archetype).toBe("mysterious");
  });
});
