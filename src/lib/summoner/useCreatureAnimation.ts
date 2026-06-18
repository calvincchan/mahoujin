// AnimationEngine — maps a dominant power string to the CSS driving a creature's idle motion.
// Returns ready-to-apply class names (float loop) plus a power-coloured glow
// pulse expressed as inline style, since the glow colour is data-driven and can't
// be a static utility class. Keyframes live in app/globals.css.

const POWER_GLOW: Record<string, string> = {
  fire:      "#f97316",
  flame:     "#f97316",
  water:     "#22d3ee",
  lightning: "#facc15",
  electric:  "#facc15",
  ice:       "#7dd3fc",
  shadow:    "#9f1239",
  dark:      "#9f1239",
  light:     "#fef9c3",
  wind:      "#7dd3fc",
  air:       "#7dd3fc",
  nature:    "#4ade80",
  earth:     "#d97706",
  ground:    "#d97706",
  mystery:   "#c4b5fd",
  psychic:   "#f472b6",
  ghost:     "#a78bfa",
  poison:    "#c084fc",
  rock:      "#a8a29e",
};

export interface CreatureAnimation {
  /** Class names for the perpetual floating idle loop. */
  floatClass: string;
  /** Inline style applying a power-coloured glow pulse. */
  glowStyle: React.CSSProperties;
  /** The resolved glow colour, exposed for particle / accent reuse. */
  glowColor: string;
}

export function useCreatureAnimation(dominantPower: string): CreatureAnimation {
  const glowColor = POWER_GLOW[dominantPower.toLowerCase()] ?? "#d4a832";

  return {
    floatClass: "creature-float",
    glowStyle: {
      // Drives the `creature-glow` keyframe via a custom property.
      ["--glow-color" as string]: glowColor,
      animation: "creature-glow 2.4s ease-in-out infinite",
    },
    glowColor,
  };
}
