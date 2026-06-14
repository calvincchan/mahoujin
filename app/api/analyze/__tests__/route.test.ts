import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { mockAnalyzeDrawing } = vi.hoisted(() => ({
  mockAnalyzeDrawing: vi.fn(),
}));

vi.mock("@/src/lib/analyzer/gemini-adapter", () => ({
  analyzeDrawing: mockAnalyzeDrawing,
}));

import { POST } from "../route";

const ATTRS = {
  archetype: "dragon",
  element: "fire",
  trait: "fierce",
  stats: { hp: 80, mp: 60, atk: 90, def: 70 },
  rarity: 3,
  confidence: "high",
};

function makeReq(body: unknown) {
  return new NextRequest("http://localhost/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  mockAnalyzeDrawing.mockResolvedValue(ATTRS);
});

describe("POST /api/analyze", () => {
  it("returns 200 with CreatureAttributes on valid imageBase64", async () => {
    const res = await POST(makeReq({ imageBase64: "abc123" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(ATTRS);
    expect(mockAnalyzeDrawing).toHaveBeenCalledWith("abc123");
  });

  it("passes exact imageBase64 string to analyzeDrawing", async () => {
    await POST(makeReq({ imageBase64: "data:image/jpeg;base64,xyz==" }));
    expect(mockAnalyzeDrawing).toHaveBeenCalledWith("data:image/jpeg;base64,xyz==");
  });

  it("returns 400 when imageBase64 is missing", async () => {
    const res = await POST(makeReq({}));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "imageBase64 required" });
  });

  it("returns 400 when imageBase64 is empty string", async () => {
    const res = await POST(makeReq({ imageBase64: "" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "imageBase64 required" });
  });

  it("returns 400 when imageBase64 is non-string", async () => {
    const res = await POST(makeReq({ imageBase64: 123 }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "imageBase64 required" });
  });

  it("returns analyzeDrawing result even when it falls back to mysterious", async () => {
    const mysterious = {
      archetype: "mysterious",
      element: "void",
      trait: "enigmatic",
      stats: { hp: 85, mp: 90, atk: 75, def: 80 },
      rarity: 5,
      confidence: "low",
    };
    mockAnalyzeDrawing.mockResolvedValue(mysterious);
    const res = await POST(makeReq({ imageBase64: "abc" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(mysterious);
  });
});
