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
  creature_archetype: "fox",
  creature_name: "Emberfang",
  complexity: 60,
  powers: ["fire", "shadow"],
  summary_description: "A lithe fox with flame-tipped tails wreathed in shadow.",
  confidence: "high",
};

const UNKNOWN = {
  creature_archetype: "unknown",
  creature_name: "Mysterious One",
  complexity: 0,
  powers: ["mystery"],
  summary_description: "An enigmatic creature of unknown origin, shrouded in swirling unknown energies.",
  confidence: "low",
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

  it("returns UNKNOWN_CREATURE when analyzeDrawing falls back (confidence low)", async () => {
    mockAnalyzeDrawing.mockResolvedValue(UNKNOWN);
    const res = await POST(makeReq({ imageBase64: "abc" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(UNKNOWN);
  });
});
