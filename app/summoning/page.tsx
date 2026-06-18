"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CreatureAttributes, CreatureAttributesSchema } from "@/src/lib/analyzer/types";
import { useCreatureAnimation } from "@/src/lib/summoner/useCreatureAnimation";
import { CreatureStatsCard } from "@/components/CreatureStatsCard";

const PARTICLE_COUNT = 12;

export default function SummoningPage() {
  const router = useRouter();
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

  const dominantPower = attrs?.powers[0] ?? "mystery";
  const { floatClass, glowStyle, glowColor } = useCreatureAnimation(dominantPower);

  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        left: 10 + Math.random() * 80,
        delay: Math.random() * 0.5,
        duration: 1 + Math.random() * 0.6,
      })),
    []
  );

  const revealed = status === "done" && !!attrs;

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-zinc-950 text-amber-50">
      {/* AI-suggested creature name above the creature. */}
      <h1 className="text-2xl font-bold mb-1 tracking-wide text-center min-h-8">
        {status === "loading"
          ? "Summoning…"
          : revealed
            ? attrs!.creature_name
            : status === "error"
              ? "Summoning"
              : ""}
      </h1>
      {revealed && (
        <p className="capitalize text-zinc-500 text-sm mb-5">{attrs!.creature_archetype}</p>
      )}

      <div className="relative w-64 h-64 mb-6 flex items-center justify-center">
        {status === "loading" && (
          <div className="text-6xl animate-pulse" aria-hidden>✨</div>
        )}

        {revealed && (
          <>
            {/* Burst of light radiating from behind the creature. */}
            <div
              className="absolute inset-0 m-auto w-40 h-40 rounded-full summon-burst pointer-events-none"
              style={{ background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)` }}
              aria-hidden
            />

            {/* Rising particles. */}
            {particles.map((p) => (
              <span
                key={p.id}
                className="absolute bottom-8 w-1.5 h-1.5 rounded-full summon-particle pointer-events-none"
                style={{
                  left: `${p.left}%`,
                  backgroundColor: glowColor,
                  animationDelay: `${p.delay}s`,
                  animationDuration: `${p.duration}s`,
                }}
                aria-hidden
              />
            ))}

            {/* The creature: entrance reveal, then perpetual float + glow. */}
            <div className="summon-reveal relative">
              <div className={floatClass} style={glowStyle}>
                {imageDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageDataUrl}
                    alt={attrs!.creature_name}
                    className="w-56 h-56 object-contain"
                  />
                ) : (
                  <div className="text-8xl" aria-hidden>✨</div>
                )}
              </div>
            </div>
          </>
        )}

        {status === "error" && (
          <div className="text-center text-zinc-500 text-sm px-4">
            No creature data found. Try capturing a magic circle first.
          </div>
        )}
      </div>

      {revealed && (
        <>
          <CreatureStatsCard attrs={attrs!} />
          <button
            onClick={() => router.push("/choice")}
            className="mt-6 px-8 py-3 rounded-xl bg-amber-400 text-zinc-950 font-bold tracking-wide hover:bg-amber-300 transition-colors"
          >
            Continue
          </button>
        </>
      )}
    </main>
  );
}
