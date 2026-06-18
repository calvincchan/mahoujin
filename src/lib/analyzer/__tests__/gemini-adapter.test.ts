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
    SchemaType: { OBJECT: "OBJECT", STRING: "STRING", INTEGER: "INTEGER", ARRAY: "ARRAY" },
  };
});

import { analyzeDrawing } from "../gemini-adapter";
import { UNKNOWN_CREATURE } from "../constants";

const VALID_RESPONSE = {
  creature_archetype: "fox",
  creature_name: "Emberfang",
  complexity: 60,
  powers: ["fire", "shadow"],
  summary_description: "A lithe fox with flame-tipped tails wreathed in shadow.",
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
      creature_archetype: "fox",
      creature_name: "Emberfang",
      complexity: 60,
      powers: ["fire", "shadow"],
      summary_description: "A lithe fox with flame-tipped tails wreathed in shadow.",
      confidence: "high",
    });
  });

  it("returns UNKNOWN_CREATURE when confidence is low", async () => {
    mockGeminiText(JSON.stringify({ ...VALID_RESPONSE, confidence: "low" }));

    const result = await analyzeDrawing("base64imagedata");

    expect(result).toEqual(UNKNOWN_CREATURE);
    expect(result.confidence).toBe("low");
  });

  it("returns UNKNOWN_CREATURE when Gemini returns malformed JSON", async () => {
    mockGeminiText("not valid json at all %%%");

    const result = await analyzeDrawing("base64imagedata");

    expect(result).toEqual(UNKNOWN_CREATURE);
  });

  it("returns UNKNOWN_CREATURE when GEMINI_API_KEY is missing", async () => {
    delete process.env.GEMINI_API_KEY;

    const result = await analyzeDrawing("base64imagedata");

    expect(result).toEqual(UNKNOWN_CREATURE);
  });

  it("returns UNKNOWN_CREATURE when Gemini throws a network error", async () => {
    mockGenerateContent.mockRejectedValue(new Error("network failure"));

    const result = await analyzeDrawing("base64imagedata");

    expect(result).toEqual(UNKNOWN_CREATURE);
  });

  it("returns UNKNOWN_CREATURE when Gemini returns valid JSON that fails Zod schema (empty powers)", async () => {
    mockGeminiText(JSON.stringify({ ...VALID_RESPONSE, powers: [] }));

    const result = await analyzeDrawing("base64imagedata");

    expect(result).toEqual(UNKNOWN_CREATURE);
  });

  it("returns UNKNOWN_CREATURE when complexity is out of range", async () => {
    mockGeminiText(JSON.stringify({ ...VALID_RESPONSE, complexity: 999 }));

    const result = await analyzeDrawing("base64imagedata");

    expect(result).toEqual(UNKNOWN_CREATURE);
  });
});
