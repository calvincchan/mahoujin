import { CreatureAttributes } from "@/src/lib/analyzer/types";

const ELEMENT_ICON: Record<string, string> = {
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

const STAT_COLOR: Record<string, string> = {
  HP:  "bg-emerald-400",
  MP:  "bg-sky-400",
  ATK: "bg-rose-400",
  DEF: "bg-amber-400",
};

const STAT_MAX = 100;

function StatBar({ label, value }: { label: string; value: number }) {
  const pct = Math.max(0, Math.min(100, (value / STAT_MAX) * 100));
  return (
    <div className="flex items-center gap-2">
      <span className="w-9 text-xs font-bold text-zinc-400">{label}</span>
      <div className="flex-1 h-2.5 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className={`h-full origin-left rounded-full ${STAT_COLOR[label]}`}
          style={{ width: `${pct}%`, animation: "stat-fill 0.8s ease-out forwards" }}
        />
      </div>
      <span className="w-7 text-right text-xs font-mono text-amber-200">{value}</span>
    </div>
  );
}

export function CreatureStatsCard({ attrs }: { attrs: CreatureAttributes }) {
  const icon = ELEMENT_ICON[attrs.element] ?? "✨";
  const stars = "★".repeat(attrs.rarity) + "☆".repeat(5 - attrs.rarity);

  return (
    <div className="w-72 rounded-2xl border border-amber-400/30 bg-zinc-900/80 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm text-zinc-300">
          <span className="text-lg" aria-hidden>{icon}</span>
          <span className="capitalize">{attrs.element}</span>
        </span>
        <span className="text-amber-400 tracking-tight" aria-label={`rarity ${attrs.rarity} of 5`}>
          {stars}
        </span>
      </div>

      <div className="space-y-1.5">
        <StatBar label="HP" value={attrs.stats.hp} />
        <StatBar label="MP" value={attrs.stats.mp} />
        <StatBar label="ATK" value={attrs.stats.atk} />
        <StatBar label="DEF" value={attrs.stats.def} />
      </div>
    </div>
  );
}
