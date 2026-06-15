"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreatureAttributes,
  CreatureAttributesSchema,
} from "@/src/lib/analyzer/types";
import { useCreatureAnimation } from "@/src/lib/summoner/useCreatureAnimation";
import { saveCreature } from "@/src/lib/storage/crystal-storage";

const ELEMENT_FALLBACK: Record<string, string> = {
  Normal: "⭐", Fire: "🔥", Water: "💧", Grass: "🌿", Electric: "⚡",
  Ice: "❄️", Fighting: "🥊", Poison: "☠️", Ground: "🏔️", Flying: "🌬️",
  Psychic: "🔮", Bug: "🐛", Rock: "🪨", Ghost: "👻", Dragon: "🐉",
  Dark: "🌑", Steel: "⚙️", Fairy: "🧚", Stellar: "✨",
};

const RELEASE_PARTICLES = 16;
const RELEASE_DURATION_MS = 1100;

type Phase = "idle" | "naming" | "releasing";

export default function ChoicePage() {
  const router = useRouter();
  const [attrs, setAttrs] = useState<CreatureAttributes | null>(null);
  const [sprite, setSprite] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [phase, setPhase] = useState<Phase>("idle");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

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
    setName(parsed.data.creatureName);
    setSprite(sessionStorage.getItem("mahoujin_sprite"));
    setStatus("ready");
  }, []);

  const { floatClass, glowStyle, glowColor } = useCreatureAnimation(
    attrs?.element ?? "Normal"
  );

  // Pre-computed scatter offsets for the release burst.
  const releaseParticles = useMemo(
    () =>
      Array.from({ length: RELEASE_PARTICLES }, (_, i) => ({
        id: i,
        left: 50 + (Math.random() - 0.5) * 60,
        dx: `${(Math.random() - 0.5) * 120}px`,
        delay: Math.random() * 0.2,
      })),
    []
  );

  async function handleConfirmKeep() {
    if (!attrs || saving) return;
    setSaving(true);
    try {
      await saveCreature(attrs, name, sprite ?? "");
      router.push("/shelf");
    } catch {
      setSaving(false);
    }
  }

  function handleRelease() {
    if (phase !== "idle") return;
    setPhase("releasing");
    window.setTimeout(() => router.push("/"), RELEASE_DURATION_MS);
  }

  const fallbackEmoji = attrs ? ELEMENT_FALLBACK[attrs.element] ?? "✨" : "✨";
  const releasing = phase === "releasing";

  if (status === "error") {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-zinc-950 text-amber-50">
        <p className="text-zinc-500 text-sm text-center px-4">
          No creature data found. Try capturing a magic circle first.
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-6 px-8 py-3 rounded-xl bg-amber-400 text-zinc-950 font-bold"
        >
          Back to capture
        </button>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-zinc-950 text-amber-50">
      {status === "ready" && attrs && (
        <>
          <h1 className="text-xl font-bold mb-1 tracking-wide text-center">
            {attrs.creatureName}
          </h1>
          <p className="capitalize text-zinc-500 text-sm mb-6">{attrs.archetype}</p>

          {/* Creature — smaller than the summon reveal, still animated. */}
          <div className="relative w-44 h-44 mb-8 flex items-center justify-center">
            {releasing &&
              releaseParticles.map((p) => (
                <span
                  key={p.id}
                  className="absolute bottom-1/2 w-1.5 h-1.5 rounded-full release-particle pointer-events-none"
                  style={{
                    left: `${p.left}%`,
                    backgroundColor: glowColor,
                    ["--dx" as string]: p.dx,
                    animationDelay: `${p.delay}s`,
                  }}
                  aria-hidden
                />
              ))}

            <div
              className={releasing ? "release-dissolve" : floatClass}
              style={releasing ? undefined : glowStyle}
            >
              {sprite ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={sprite}
                  alt={attrs.creatureName}
                  className="w-40 h-40 object-contain"
                />
              ) : (
                <div className="text-7xl" aria-hidden>
                  {fallbackEmoji}
                </div>
              )}
            </div>
          </div>

          {!releasing && (
            <p className="text-zinc-400 text-sm mb-6">
              What will you do with your creature?
            </p>
          )}

          {/* Keep / Release actions. */}
          {phase === "idle" && (
            <div className="flex gap-4">
              <button
                onClick={() => setPhase("naming")}
                className="px-8 py-3 rounded-xl bg-amber-400 text-zinc-950 font-bold tracking-wide hover:bg-amber-300 transition-colors"
              >
                Keep
              </button>
              <button
                onClick={handleRelease}
                className="px-8 py-3 rounded-xl border border-zinc-700 text-zinc-300 font-bold tracking-wide hover:border-zinc-500 transition-colors"
              >
                Release
              </button>
            </div>
          )}
        </>
      )}

      {/* Keep flow — rename bottom sheet. */}
      {phase === "naming" && attrs && (
        <div
          className="fixed inset-0 z-30 flex items-end bg-black/60"
          onClick={() => !saving && setPhase("idle")}
        >
          <div
            className="sheet-up w-full rounded-t-3xl bg-zinc-900 border-t border-zinc-800 p-6 pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-amber-50 mb-1">Name your creature</h2>
            <p className="text-zinc-500 text-sm mb-4">
              Keep the suggested name or make it your own.
            </p>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-700 text-amber-50 text-lg focus:border-amber-400 focus:outline-none"
            />
            <button
              onClick={handleConfirmKeep}
              disabled={saving || !name.trim()}
              className="mt-5 w-full px-8 py-3 rounded-xl bg-amber-400 text-zinc-950 font-bold tracking-wide hover:bg-amber-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? "Saving…" : "Confirm"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
