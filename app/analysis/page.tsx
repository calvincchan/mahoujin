"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const FLAVOUR_TEXTS = [
  "Reading the magic circle…",
  "Sensing elemental energies…",
  "Deciphering the sigils…",
  "A creature stirs…",
  "Consulting the arcane records…",
  "Weaving the summoning thread…",
];

export default function AnalysisPage() {
  const router = useRouter();
  const [flavourIndex, setFlavourIndex] = useState(0);
  const hasRun = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFlavourIndex((i) => (i + 1) % FLAVOUR_TEXTS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    async function analyse() {
      const imageBase64 = sessionStorage.getItem("mahoujin_capture");
      if (!imageBase64) {
        router.replace("/summoning?mysterious=1");
        return;
      }

      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64 }),
        });
        const attrs = await res.json();
        sessionStorage.setItem("mahoujin_attrs", JSON.stringify(attrs));
      } catch {
        // Analyzer already falls back internally; if network fails, use mysterious
        const mysterious = {
          archetype: "mysterious",
          element: "void",
          trait: "enigmatic",
          stats: { hp: 85, mp: 90, atk: 75, def: 80 },
          rarity: 5,
          confidence: "low",
        };
        sessionStorage.setItem("mahoujin_attrs", JSON.stringify(mysterious));
      }

      router.replace("/summoning");
    }

    analyse();
  }, [router]);

  return (
    <main className="fixed inset-0 bg-[#0d0820] flex flex-col items-center justify-center overflow-hidden">
      {/* Drifting particles */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="absolute w-1 h-1 rounded-full bg-amber-400/30 animate-pulse"
            style={{
              left: `${(i * 37 + 11) % 100}%`,
              top: `${(i * 53 + 7) % 100}%`,
              animationDelay: `${(i * 0.3) % 2}s`,
              animationDuration: `${2 + (i % 3)}s`,
            }}
          />
        ))}
      </div>

      {/* Rotating magic circle */}
      <div className="relative w-48 h-48 mb-10">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-amber-400/60 animate-spin [animation-duration:8s]" />
        {/* Inner ring */}
        <div className="absolute inset-4 rounded-full border border-amber-400/40 animate-spin [animation-duration:5s] [animation-direction:reverse]" />
        {/* Core glow */}
        <div className="absolute inset-8 rounded-full bg-amber-400/10 border border-amber-400/50 animate-pulse" />
        {/* Cardinal markers */}
        {[0, 90, 180, 270].map((deg) => (
          <div
            key={deg}
            className="absolute inset-0 flex items-start justify-center animate-spin [animation-duration:8s]"
            style={{ transform: `rotate(${deg}deg)` }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1" />
          </div>
        ))}
        {/* Centre sigil */}
        <div className="absolute inset-0 flex items-center justify-center text-amber-400/70 text-2xl select-none">
          ✦
        </div>
      </div>

      {/* Loading text */}
      <p className="text-amber-200 text-lg font-mono tracking-wide text-center px-8 transition-opacity duration-500">
        {FLAVOUR_TEXTS[flavourIndex]}
      </p>
    </main>
  );
}
