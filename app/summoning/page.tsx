// PROTOTYPE — throwaway. Question: does Gemini image gen produce acceptable pixel art sprites?
"use client";

import { useEffect, useState } from "react";
import { CreatureAttributes, CreatureAttributesSchema } from "@/src/lib/analyzer/types";

const ELEMENT_FALLBACK: Record<string, string> = {
  Normal:   "⭐",
  Fire:     "🔥",
  Water:    "💧",
  Grass:    "🌿",
  Electric: "⚡",
  Ice:      "❄️",
  Fighting: "🥊",
  Poison:   "☠️",
  Ground:   "🏔️",
  Flying:   "🌬️",
  Psychic:  "🔮",
  Bug:      "🐛",
  Rock:     "🪨",
  Ghost:    "👻",
  Dragon:   "🐉",
  Dark:     "🌑",
  Steel:    "⚙️",
  Fairy:    "🧚",
  Stellar:  "✨",
};

export default function SummoningPage() {
  const [attrs, setAttrs] = useState<CreatureAttributes | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");

  useEffect(() => {
    const raw = sessionStorage.getItem("mahoujin_attrs");
    if (!raw) {
      setStatus("error");
      return;
    }

    const parsed = CreatureAttributesSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      setStatus("error");
      return;
    }

    setAttrs(parsed.data);

    fetch("/api/summon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    })
      .then((r) => r.json())
      .then((data: { imageDataUrl?: string }) => {
        if (data.imageDataUrl) {
          setImageDataUrl(data.imageDataUrl);
          sessionStorage.setItem("mahoujin_sprite", data.imageDataUrl);
        }
        setStatus("done");
      })
      .catch(() => setStatus("done"));
  }, []);

  const fallbackEmoji = attrs ? (ELEMENT_FALLBACK[attrs.element] ?? "✨") : "✨";
  const rarityStars = attrs ? "★".repeat(attrs.rarity) + "☆".repeat(5 - attrs.rarity) : "";

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-zinc-950 text-amber-50">
      <h1 className="text-2xl font-bold mb-6 tracking-wide">
        {status === "loading" ? "Summoning…" : attrs ? `${attrs.archetype} awakens` : "Summoning"}
      </h1>

      <div className="w-64 h-64 rounded-2xl border border-amber-400/30 bg-zinc-900 flex items-center justify-center mb-6 overflow-hidden">
        {status === "loading" && (
          <div className="text-6xl animate-pulse">{fallbackEmoji}</div>
        )}
        {status === "done" && imageDataUrl && (
          <img
            src={imageDataUrl}
            alt={attrs?.archetype ?? "creature"}
            className="w-full h-full object-contain"
          />
        )}
        {status === "done" && !imageDataUrl && (
          <div className="text-8xl">{fallbackEmoji}</div>
        )}
        {status === "error" && (
          <div className="text-center text-zinc-500 text-sm px-4">
            No creature data found. Try capturing a magic circle first.
          </div>
        )}
      </div>

      {attrs && status === "done" && (
        <div className="text-center space-y-1">
          <p className="text-amber-400 text-lg">{rarityStars}</p>
          <p className="capitalize text-zinc-300">
            {attrs.element} · {attrs.creatureName}
          </p>
          <div className="grid grid-cols-4 gap-3 mt-4 text-xs text-zinc-400">
            <div className="text-center"><div className="text-amber-300 font-bold">{attrs.stats.hp}</div><div>HP</div></div>
            <div className="text-center"><div className="text-amber-300 font-bold">{attrs.stats.mp}</div><div>MP</div></div>
            <div className="text-center"><div className="text-amber-300 font-bold">{attrs.stats.atk}</div><div>ATK</div></div>
            <div className="text-center"><div className="text-amber-300 font-bold">{attrs.stats.def}</div><div>DEF</div></div>
          </div>
        </div>
      )}
    </main>
  );
}
