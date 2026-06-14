// PROTOTYPE — throwaway. Seeds sessionStorage so /summoning is testable without a camera.
"use client";

import { useRouter } from "next/navigation";
import { CreatureAttributes } from "@/src/lib/analyzer/types";

const SAMPLES: CreatureAttributes[] = [
  { archetype: "dragon",     element: "fire",    trait: "fierce",    stats: { hp: 80, mp: 60, atk: 90, def: 50 }, rarity: 4, confidence: "high" },
  { archetype: "fox",        element: "void",    trait: "cunning",   stats: { hp: 65, mp: 95, atk: 70, def: 45 }, rarity: 5, confidence: "high" },
  { archetype: "golem",      element: "earth",   trait: "stoic",     stats: { hp: 95, mp: 30, atk: 75, def: 95 }, rarity: 3, confidence: "high" },
  { archetype: "spirit",     element: "wind",    trait: "playful",   stats: { hp: 50, mp: 90, atk: 55, def: 40 }, rarity: 2, confidence: "high" },
  { archetype: "mysterious", element: "unknown", trait: "enigmatic", stats: { hp: 85, mp: 90, atk: 75, def: 80 }, rarity: 5, confidence: "low"  },
];

export default function DevSeedPage() {
  const router = useRouter();

  function seed(attrs: CreatureAttributes) {
    sessionStorage.setItem("mahoujin_attrs", JSON.stringify(attrs));
    router.push("/summoning");
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-8">
      <h1 className="text-amber-400 text-xl font-bold mb-2">Dev Seed</h1>
      <p className="text-zinc-500 text-sm mb-6">PROTOTYPE — pick a creature to test /summoning</p>
      <div className="flex flex-col gap-3 max-w-sm">
        {SAMPLES.map((s) => (
          <button
            key={s.archetype}
            onClick={() => seed(s)}
            className="text-left p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-400/50 transition-colors"
          >
            <div className="text-amber-300 font-semibold capitalize">{s.archetype}</div>
            <div className="text-zinc-400 text-sm">
              {s.element} · {s.trait} · {"★".repeat(s.rarity)}
            </div>
          </button>
        ))}
      </div>
    </main>
  );
}
