const POWER_ORB: Record<string, [string, string]> = {
  fire:      ["#dc2626", "#f97316"],
  flame:     ["#dc2626", "#f97316"],
  water:     ["#0284c7", "#22d3ee"],
  lightning: ["#eab308", "#fef9c3"],
  electric:  ["#eab308", "#fef9c3"],
  ice:       ["#7dd3fc", "#e0f2fe"],
  shadow:    ["#1c1917", "#991b1b"],
  dark:      ["#1c1917", "#991b1b"],
  light:     ["#f472b6", "#f0fdf4"],
  wind:      ["#38bdf8", "#e0f2fe"],
  air:       ["#38bdf8", "#e0f2fe"],
  nature:    ["#16a34a", "#ca8a04"],
  earth:     ["#b45309", "#c2410c"],
  ground:    ["#b45309", "#c2410c"],
  mystery:   ["#6d28d9", "#e0f2fe"],
  ghost:     ["#4338ca", "#c4b5fd"],
  psychic:   ["#ec4899", "#c084fc"],
  poison:    ["#7e22ce", "#65a30d"],
  rock:      ["#78716c", "#d6d3d1"],
};

export function getPowerOrbColor(powers: string[]): { primary: string; secondary: string } {
  const dominant = (powers[0] ?? "mystery").toLowerCase();
  const pair = POWER_ORB[dominant] ?? ["#a8a878", "#c8c8a0"];
  const [primary, secondary] = pair;
  return { primary, secondary };
}
