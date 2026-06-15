import { Element } from "../analyzer/types";

const ORB_COLOR: Record<Element, [string, string]> = {
  Normal:   ["#a8a878", "#c8c8a0"],
  Fire:     ["#dc2626", "#f97316"],
  Water:    ["#0284c7", "#22d3ee"],
  Grass:    ["#16a34a", "#ca8a04"],
  Electric: ["#eab308", "#fef9c3"],
  Ice:      ["#7dd3fc", "#e0f2fe"],
  Fighting: ["#b91c1c", "#78350f"],
  Poison:   ["#7e22ce", "#65a30d"],
  Ground:   ["#b45309", "#c2410c"],
  Flying:   ["#38bdf8", "#e0f2fe"],
  Psychic:  ["#ec4899", "#c084fc"],
  Bug:      ["#65a30d", "#a16207"],
  Rock:     ["#78716c", "#d6d3d1"],
  Ghost:    ["#4338ca", "#c4b5fd"],
  Dragon:   ["#1e3a8a", "#d97706"],
  Dark:     ["#1c1917", "#991b1b"],
  Steel:    ["#94a3b8", "#1d4ed8"],
  Fairy:    ["#f472b6", "#f0fdf4"],
  Stellar:  ["#6d28d9", "#e0f2fe"],
};

export function getElementOrbColor(element: string): { primary: string; secondary: string } {
  const pair = ORB_COLOR[element as Element] ?? ["#a8a878", "#c8c8a0"];
  const [primary, secondary] = pair;
  return { primary, secondary };
}
