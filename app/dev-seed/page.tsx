// PROTOTYPE — throwaway. Seeds sessionStorage so /summoning is testable without a camera.
"use client";

import { useRouter } from "next/navigation";
import { CreatureAttributes } from "@/src/lib/analyzer/types";

const SAMPLES: CreatureAttributes[] = [
  { creature_archetype: "serpent",       creature_name: "Drakonis",    complexity: 70, powers: ["fire", "shadow"],          summary_description: "A sinuous dragon-serpent with iridescent midnight scales, trailing fire and shadow.",                           confidence: "high" },
  { creature_archetype: "fox",           creature_name: "Phantail",    complexity: 80, powers: ["ghost", "shadow"],          summary_description: "A translucent fox spirit trailing wisps of cold violet flame, flickering between solid and shadow.",            confidence: "high" },
  { creature_archetype: "turtle",        creature_name: "Granitusk",   complexity: 55, powers: ["rock", "earth"],            summary_description: "A stout armoured tortoise with shell encrusted in jagged granite spires, moving on craggy stone limbs.",       confidence: "high" },
  { creature_archetype: "bird",          creature_name: "Zephyring",   complexity: 35, powers: ["wind", "light"],            summary_description: "A cheerful songbird with cloud-white plumage and sky-blue wing-tips that leave faint contrails.",               confidence: "high" },
  { creature_archetype: "unknown",       creature_name: "Mysterious One", complexity: 0, powers: ["mystery"],               summary_description: "An enigmatic creature of unknown origin, shrouded in swirling unknown energies.",                               confidence: "low"  },
  { creature_archetype: "caterpillar",   creature_name: "Silkwurm",    complexity: 25, powers: ["nature", "poison"],         summary_description: "A plump, velvety caterpillar ringed in lime-green segments with tiny amber eyes.",                             confidence: "high" },
  { creature_archetype: "rodent",        creature_name: "Voltwhisk",   complexity: 40, powers: ["lightning", "lightning"],   summary_description: "A round-cheeked rodent with golden fur crackling at the tips, enormous ears acting as antennae.",             confidence: "high" },
  { creature_archetype: "bat",           creature_name: "Nightfurl",   complexity: 50, powers: ["shadow", "dark"],           summary_description: "A sleek obsidian bat whose wings are edged in deep crimson membrane, vanishing into shadow.",                  confidence: "high" },
  { creature_archetype: "wolf",          creature_name: "Frostbark",   complexity: 55, powers: ["ice", "wind"],              summary_description: "A lean silver-furred hound with ice-crystal fur along its spine and breath that blooms into fern-frost.",     confidence: "high" },
  { creature_archetype: "bear",          creature_name: "Mossgrip",    complexity: 45, powers: ["nature", "earth"],          summary_description: "A barrel-shaped bear cub draped in a mossy pelt threaded with tiny wildflowers.",                              confidence: "high" },
  { creature_archetype: "butterfly",     creature_name: "Lumiscale",   complexity: 75, powers: ["psychic", "light"],         summary_description: "An elegant butterfly with wing-panels like stained glass in hot pink and lavender.",                           confidence: "high" },
  { creature_archetype: "spider",        creature_name: "Venomweft",   complexity: 60, powers: ["poison", "shadow"],         summary_description: "An eight-legged weaver draped in acid-green and deep purple, trailing iridescent silk threads.",               confidence: "high" },
  { creature_archetype: "construct",     creature_name: "Polarcog",    complexity: 55, powers: ["lightning", "rock"],        summary_description: "A floating magnet spirit formed from two silver horseshoe arms orbiting a central core of magnetised iron.",   confidence: "high" },
  { creature_archetype: "gauntlet",      creature_name: "Ironveil",    complexity: 60, powers: ["fire", "earth"],            summary_description: "A sentient gauntlet of deep red iron with ancient runes, floating upright with quiet menace.",                 confidence: "high" },
  { creature_archetype: "chest",         creature_name: "Chestpurr",   complexity: 40, powers: ["mystery"],                  summary_description: "A curious creature shaped like a small wooden chest, scurrying on tiny claw-feet with tail wagging.",          confidence: "high" },
  { creature_archetype: "kappa",         creature_name: "Kappamori",   complexity: 70, powers: ["water", "water", "nature"], summary_description: "A kappa-like spirit balancing a bowl of shimmering water on its head, launching water jets from its palms.",  confidence: "high" },
  { creature_archetype: "cat",           creature_name: "Ribbonpaw",   complexity: 50, powers: ["light", "wind"],            summary_description: "A dainty calico cat with rose-tipped ears and a curling tail tied with a gossamer bow.",                       confidence: "high" },
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
        {SAMPLES.map((s, i) => (
          <button
            key={i}
            onClick={() => seed(s)}
            className="text-left p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-400/50 transition-colors"
          >
            <div className="text-amber-300 font-semibold capitalize">{s.creature_archetype}</div>
            <div className="text-zinc-400 text-sm">
              {s.powers.join(", ")} · {s.creature_name} · {"★".repeat(Math.max(1, Math.ceil(s.complexity / 20)))}
            </div>
          </button>
        ))}
      </div>
    </main>
  );
}
