import { NextRequest, NextResponse } from "next/server";
import { analyzeDrawing } from "@/src/lib/analyzer/gemini-adapter";

export async function POST(req: NextRequest) {
  const { imageBase64 } = await req.json();
  if (!imageBase64 || typeof imageBase64 !== "string") {
    return NextResponse.json({ error: "imageBase64 required" }, { status: 400 });
  }
  const attrs = await analyzeDrawing(imageBase64);
  return NextResponse.json(attrs);
}
