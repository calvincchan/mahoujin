"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SavedCreature } from "@/src/lib/analyzer/types";
import { getAll, deleteCreature } from "@/src/lib/storage/crystal-storage";
import { getElementOrbColor } from "@/src/lib/shelf/orb-color";
import { CreatureStatsCard } from "@/components/CreatureStatsCard";
import { useCreatureAnimation } from "@/src/lib/summoner/useCreatureAnimation";

const ELEMENT_FALLBACK: Record<string, string> = {
  Normal: "⭐", Fire: "🔥", Water: "💧", Grass: "🌿", Electric: "⚡",
  Ice: "❄️", Fighting: "🥊", Poison: "☠️", Ground: "🏔️", Flying: "🌬️",
  Psychic: "🔮", Bug: "🐛", Rock: "🪨", Ghost: "👻", Dragon: "🐉",
  Dark: "🌑", Steel: "⚙️", Fairy: "🧚", Stellar: "✨",
};

const MIN_SLOTS = 9;
const RELEASE_PARTICLE_COUNT = 14;

function OrbSlot({ creature, onClick }: { creature: SavedCreature; onClick: () => void }) {
  const { primary, secondary } = getElementOrbColor(creature.element);
  const fallback = ELEMENT_FALLBACK[creature.element] ?? "✨";

  return (
    <button
      onClick={onClick}
      aria-label={`View ${creature.name}`}
      className="relative flex items-center justify-center rounded-full aspect-square w-full overflow-hidden active:scale-95 transition-transform"
      style={{
        background: `radial-gradient(circle at 35% 35%, ${secondary}, ${primary})`,
        boxShadow: `0 0 18px 4px ${primary}66, inset 0 0 8px ${secondary}88`,
      }}
    >
      {creature.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={creature.imageUrl}
          alt={creature.name}
          className="w-4/5 h-4/5 object-contain drop-shadow-lg"
        />
      ) : (
        <span className="text-3xl" aria-hidden>{fallback}</span>
      )}
      {/* Inner highlight shimmer */}
      <span
        className="absolute top-[10%] left-[20%] w-[30%] h-[20%] rounded-full opacity-40 pointer-events-none"
        style={{ background: "radial-gradient(circle, white, transparent)" }}
        aria-hidden
      />
    </button>
  );
}

function EmptySlot() {
  return (
    <div
      className="flex items-center justify-center rounded-full aspect-square w-full border border-zinc-700/50 bg-zinc-900/30"
      aria-hidden
    >
      <span className="text-zinc-600 text-xl font-thin">+</span>
    </div>
  );
}

function DetailOverlay({
  creature,
  onClose,
  onRelease,
  releasing,
}: {
  creature: SavedCreature;
  onClose: () => void;
  onRelease: (id: string) => Promise<void>;
  releasing: boolean;
}) {
  const { floatClass, glowStyle, glowColor } = useCreatureAnimation(creature.element);
  const fallback = ELEMENT_FALLBACK[creature.element] ?? "✨";

  const particles = useMemo(
    () =>
      Array.from({ length: RELEASE_PARTICLE_COUNT }, (_, i) => ({
        id: i,
        left: 50 + (Math.random() - 0.5) * 60,
        dx: `${(Math.random() - 0.5) * 120}px`,
        delay: Math.random() * 0.2,
      })),
    []
  );

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-zinc-950 text-amber-50 overflow-y-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 shrink-0">
        <button
          onClick={onClose}
          disabled={releasing}
          className="text-zinc-400 text-sm hover:text-amber-50 transition-colors disabled:opacity-40"
        >
          ← Back
        </button>
        <span className="text-xs uppercase tracking-widest text-zinc-500 font-mono capitalize">
          {creature.category}
        </span>
      </div>

      <div className="flex flex-col items-center px-4 pt-6 pb-10 gap-6">
        <h1 className="text-2xl font-bold tracking-wide text-center">{creature.name}</h1>
        <p className="capitalize text-zinc-500 text-sm -mt-4">{creature.archetype}</p>

        {/* Creature sprite */}
        <div className="relative w-52 h-52 flex items-center justify-center">
          {releasing &&
            particles.map((p) => (
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
            {creature.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={creature.imageUrl}
                alt={creature.name}
                className="w-48 h-48 object-contain"
              />
            ) : (
              <div className="text-7xl" aria-hidden>{fallback}</div>
            )}
          </div>
        </div>

        <CreatureStatsCard attrs={creature} />

        <p className="text-zinc-600 text-xs font-mono">
          Captured {new Date(creature.capturedAt).toLocaleDateString()}
        </p>

        <button
          onClick={() => onRelease(creature.id)}
          disabled={releasing}
          className="w-full max-w-xs px-8 py-3 rounded-xl border border-zinc-700 text-zinc-300 font-bold tracking-wide hover:border-red-700 hover:text-red-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {releasing ? "Releasing…" : "Release"}
        </button>
      </div>
    </div>
  );
}

export default function ShelfPage() {
  const [creatures, setCreatures] = useState<SavedCreature[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<SavedCreature | null>(null);
  const [releasing, setReleasing] = useState(false);

  useEffect(() => {
    getAll().then((all) => {
      setCreatures(all);
      setLoading(false);
    });
  }, []);

  async function handleRelease(id: string) {
    setReleasing(true);
    // Brief pause so the dissolve animation plays before the overlay closes
    await new Promise((r) => setTimeout(r, 1100));
    await deleteCreature(id);
    setCreatures((prev) => prev.filter((c) => c.id !== id));
    setSelected(null);
    setReleasing(false);
  }

  // Pad to the next multiple of 3, minimum MIN_SLOTS
  const totalSlots = Math.max(MIN_SLOTS, Math.ceil((creatures.length + 1) / 3) * 3);
  const emptyCount = totalSlots - creatures.length;

  return (
    <main className="min-h-screen bg-zinc-950 text-amber-50 flex flex-col">
      {/* Top nav */}
      <nav className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 shrink-0">
        <h1 className="text-base font-bold tracking-wide">Crystal Shelf</h1>
        <Link
          href="/"
          aria-label="Back to scan"
          className="w-9 h-9 rounded-full border border-amber-400/50 flex items-center justify-center text-amber-400/70 hover:text-amber-400 hover:border-amber-400 transition-colors text-sm font-mono"
        >
          ◎
        </Link>
      </nav>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-zinc-500 text-sm animate-pulse">Loading…</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4">
          {creatures.length === 0 && (
            <p className="text-center text-zinc-600 text-sm mb-6">
              No creatures yet. Capture a magic circle to begin.
            </p>
          )}
          <div className="grid grid-cols-3 gap-4">
            {creatures.map((c) => (
              <OrbSlot key={c.id} creature={c} onClick={() => setSelected(c)} />
            ))}
            {Array.from({ length: emptyCount }).map((_, i) => (
              <EmptySlot key={i} />
            ))}
          </div>
        </div>
      )}

      {selected && (
        <DetailOverlay
          creature={selected}
          onClose={() => !releasing && setSelected(null)}
          onRelease={handleRelease}
          releasing={releasing}
        />
      )}
    </main>
  );
}
