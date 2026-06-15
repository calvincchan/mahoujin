import { Element } from "../analyzer/types";

// AnimationEngine — maps an Element to the CSS driving a creature's idle motion.
// Returns ready-to-apply class names (float loop) plus an element-coloured glow
// pulse expressed as inline style, since the glow colour is data-driven and can't
// be a static utility class. Keyframes live in app/globals.css.

const ELEMENT_GLOW: Record<Element, string> = {
  Normal:   "#c8c8a0",
  Fire:     "#f97316",
  Water:    "#22d3ee",
  Grass:    "#4ade80",
  Electric: "#facc15",
  Ice:      "#7dd3fc",
  Fighting: "#dc2626",
  Poison:   "#c084fc",
  Ground:   "#d97706",
  Flying:   "#7dd3fc",
  Psychic:  "#f472b6",
  Bug:      "#a3e635",
  Rock:     "#a8a29e",
  Ghost:    "#a78bfa",
  Dragon:   "#60a5fa",
  Dark:     "#9f1239",
  Steel:    "#93c5fd",
  Fairy:    "#f9a8d4",
  Stellar:  "#c4b5fd",
};

export interface CreatureAnimation {
  /** Class names for the perpetual floating idle loop. */
  floatClass: string;
  /** Inline style applying an element-coloured glow pulse. */
  glowStyle: React.CSSProperties;
  /** The resolved glow colour, exposed for particle / accent reuse. */
  glowColor: string;
}

export function useCreatureAnimation(element: Element): CreatureAnimation {
  const glowColor = ELEMENT_GLOW[element] ?? "#d4a832";

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
