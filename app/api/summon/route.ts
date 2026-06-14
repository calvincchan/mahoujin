// PROTOTYPE — throwaway. Question: does Gemini image gen produce acceptable pixel art sprites?
import { NextRequest, NextResponse } from "next/server";
import { CreatureAttributesSchema } from "@/src/lib/analyzer/types";
import {
  generateCreatureSprite,
  buildFallbackSvg,
} from "@/src/lib/summoner/gemini-image-adapter";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = CreatureAttributesSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid creature attributes" }, { status: 400 });
  }

  const attrs = parsed.data;

  // Try Gemini image gen (requires paid API plan). Falls back to SVG placeholder.
  const geminiImage = await generateCreatureSprite(attrs);
  const imageDataUrl = geminiImage ?? buildFallbackSvg(attrs);

  return NextResponse.json({ imageDataUrl, source: geminiImage ? "gemini" : "fallback" });
}
