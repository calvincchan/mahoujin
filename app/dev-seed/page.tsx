// PROTOTYPE — throwaway. Seeds sessionStorage so /summoning is testable without a camera.
"use client";

import { useRouter } from "next/navigation";
import { CreatureAttributes } from "@/src/lib/analyzer/types";

const SAMPLES: CreatureAttributes[] = [
  { archetype: "serpent",    element: "Dragon",  creatureName: "Drakonis",    description: "A sinuous dragon-serpent with iridescent midnight scales and crests of molten gold, coiling through the air with predatory grace.",    stats: { hp: 80, mp: 60, atk: 90, def: 50 }, rarity: 4, confidence: "high" },
  { archetype: "fox",        element: "Ghost",   creatureName: "Phantail",    description: "A translucent fox spirit trailing wisps of cold violet flame, its nine tails flickering between solid and shadow with each step.",       stats: { hp: 65, mp: 95, atk: 70, def: 45 }, rarity: 5, confidence: "high" },
  { archetype: "turtle",     element: "Rock",    creatureName: "Granitusk",   description: "A stout armoured tortoise whose shell is encrusted with jagged granite spires, moving with unhurried confidence on craggy stone limbs.", stats: { hp: 95, mp: 30, atk: 75, def: 95 }, rarity: 3, confidence: "high" },
  { archetype: "regional-bird", element: "Flying", creatureName: "Zephyring", description: "A cheerful songbird with cloud-white plumage and sky-blue wing-tips that leave faint contrails as it darts and loops through the air.", stats: { hp: 50, mp: 90, atk: 55, def: 40 }, rarity: 2, confidence: "high" },
  { archetype: "mysterious", element: "Stellar", creatureName: "???",         description: "A stellar entity of unknown origin, shimmering with cosmic energy and starlight. Its form shifts between states as though existing in multiple dimensions at once.", stats: { hp: 85, mp: 90, atk: 75, def: 80 }, rarity: 5, confidence: "low"  },
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
              {s.element} · {s.creatureName} · {"★".repeat(s.rarity)}
            </div>
          </button>
        ))}
      </div>
    </main>
  );
}
