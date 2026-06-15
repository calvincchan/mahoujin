import { analyzeDrawing } from "@/src/lib/analyzer/gemini-adapter";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  const { imageBase64 } = body;
  if (!imageBase64 || typeof imageBase64 !== "string") {
    return NextResponse.json({ error: "imageBase64 required" }, { status: 400 });
  }
  const attrs = await analyzeDrawing(imageBase64);
  console.log(attrs);
  return NextResponse.json(attrs);
}
