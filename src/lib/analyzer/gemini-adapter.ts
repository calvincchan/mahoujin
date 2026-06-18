import { GoogleGenerativeAI, SchemaType, type Schema } from "@google/generative-ai";
import { SYSTEM_PROMPT } from "./prompt";
import { CreatureAttributes, CreatureAttributesSchema } from "./types";
import { UNKNOWN_CREATURE } from "./constants";

let _genAI: GoogleGenerativeAI | null = null;
function getGenAI(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");
  if (!_genAI) _genAI = new GoogleGenerativeAI(apiKey);
  return _genAI;
}

function parseDataUrl(imageBase64: string): { mimeType: string; data: string } {
  const match = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
  if (match) return { mimeType: match[1], data: match[2] };
  return { mimeType: "image/jpeg", data: imageBase64 };
}

// Keep in sync with CreatureAttributesSchema in types.ts
const responseSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    creature_archetype: { type: SchemaType.STRING },
    creature_name: { type: SchemaType.STRING },
    complexity: { type: SchemaType.INTEGER },
    powers: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    summary_description: { type: SchemaType.STRING },
    confidence: { type: SchemaType.STRING, format: "enum", enum: ["high", "low"] },
  },
  required: ["creature_archetype", "creature_name", "complexity", "powers", "summary_description", "confidence"],
};

export async function analyzeDrawing(
  imageBase64: string
): Promise<CreatureAttributes> {
  try {
    const model = getGenAI().getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema,
      },
    });

    const { mimeType, data } = parseDataUrl(imageBase64);
    const result = await model.generateContent([
      {
        inlineData: { mimeType, data },
      },
      "Analyse this mahoujin drawing and return the creature attributes as JSON.",
    ]);

    const text = result.response.text();
    const parsed = JSON.parse(text);
    const attrs = CreatureAttributesSchema.parse(parsed);

    if (attrs.confidence === "low") {
      return UNKNOWN_CREATURE;
    }

    return attrs;
  } catch {
    return UNKNOWN_CREATURE;
  }
}
