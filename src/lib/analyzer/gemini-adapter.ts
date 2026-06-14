import { GoogleGenerativeAI, SchemaType, type Schema } from "@google/generative-ai";
import { SYSTEM_PROMPT } from "./prompt";
import {
  CreatureAttributes,
  CreatureAttributesSchema,
  MYSTERIOUS_CREATURE,
} from "./types";

const responseSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    archetype: { type: SchemaType.STRING },
    element: {
      type: SchemaType.STRING,
      format: "enum",
      enum: ["fire", "water", "earth", "wind", "void", "unknown"],
    },
    trait: { type: SchemaType.STRING },
    stats: {
      type: SchemaType.OBJECT,
      properties: {
        hp: { type: SchemaType.INTEGER },
        mp: { type: SchemaType.INTEGER },
        atk: { type: SchemaType.INTEGER },
        def: { type: SchemaType.INTEGER },
      },
      required: ["hp", "mp", "atk", "def"],
    },
    rarity: { type: SchemaType.INTEGER },
    confidence: { type: SchemaType.STRING, format: "enum", enum: ["high", "low"] },
  },
  required: ["archetype", "element", "trait", "stats", "rarity", "confidence"],
};

export async function analyzeDrawing(
  imageBase64: string
): Promise<CreatureAttributes> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY not set");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema,
      },
    });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64,
        },
      },
      "Analyse this mahoujin drawing and return the creature attributes as JSON.",
    ]);

    const text = result.response.text();
    const parsed = JSON.parse(text);
    const attrs = CreatureAttributesSchema.parse(parsed);

    if (attrs.confidence === "low") {
      return {
        ...MYSTERIOUS_CREATURE,
        rarity: Math.random() < 0.5 ? 4 : 5,
      };
    }

    return attrs;
  } catch {
    return MYSTERIOUS_CREATURE;
  }
}
