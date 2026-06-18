import { CreatureAttributes } from "@/src/lib/analyzer/types";

const POWER_EMOJI: Record<string, string> = {
  fire:      "🔥",
  flame:     "🔥",
  water:     "💧",
  lightning: "⚡",
  electric:  "⚡",
  ice:       "❄️",
  shadow:    "🌑",
  dark:      "🌑",
  light:     "✨",
  wind:      "🌬️",
  air:       "🌬️",
  nature:    "🌿",
  earth:     "🏔️",
  ground:    "🏔️",
  mystery:   "🔮",
  ghost:     "👻",
  psychic:   "🔮",
  poison:    "☠️",
  rock:      "🪨",
};

function powerEmoji(power: string): string {
  return POWER_EMOJI[power.toLowerCase()] ?? "✨";
}

export function CreatureStatsCard({ attrs }: { attrs: CreatureAttributes }) {
  const rarity = Math.max(1, Math.ceil(attrs.complexity / 20));
  const stars = "★".repeat(rarity) + "☆".repeat(5 - rarity);

  return (
    <div className="w-72 rounded-2xl border border-amber-400/30 bg-zinc-900/80 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-400 capitalize">{attrs.creature_archetype}</span>
        <span className="text-amber-400 tracking-tight" aria-label={`rarity ${rarity} of 5`}>
          {stars}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {attrs.powers.map((p, i) => (
          <span
            key={i}
            className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-amber-200 capitalize border border-zinc-700"
          >
            {powerEmoji(p)} {p}
          </span>
        ))}
      </div>
    </div>
  );
}
