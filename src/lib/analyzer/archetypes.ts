export type ArchetypeCategory =
  | "Mammalian"
  | "Insectoid"
  | "Avian"
  | "Reptilian"
  | "Inorganic"
  | "Mythological";

export type ArchetypeBlueprint =
  | "caterpillar"
  | "fox"
  | "rodent"
  | "bat"
  | "canine"
  | "bear"
  | "butterfly"
  | "spider"
  | "regional-bird"
  | "serpent"
  | "turtle"
  | "magnet"
  | "weapon"
  | "mimic"
  | "yokai"
  | "domestic-cat";

export interface PokemonArchetype {
  id: ArchetypeBlueprint;
  name: string;
  category: ArchetypeCategory;
  description: string;
  evolutionaryPattern?: string;
  commonInspirations: string[];
}

export const ARCHETYPE_REGISTRY: Record<ArchetypeBlueprint, PokemonArchetype> = {
  caterpillar: {
    id: "caterpillar",
    name: "Caterpillar",
    category: "Insectoid",
    description: "A small, segmented larval creature with large expressive eyes and stubby legs. Often sports a colourful body pattern that hints at its eventual evolved form.",
    evolutionaryPattern: "larva → cocoon → butterfly/moth",
    commonInspirations: ["Caterpie", "Weedle", "Wurmple", "Scatterbug"],
  },
  fox: {
    id: "fox",
    name: "Fox",
    category: "Mammalian",
    description: "A lithe, sharp-eared fox spirit with a bushy tail and cunning gaze. Elemental variants alter fur colour and tail count, hinting at spiritual power.",
    evolutionaryPattern: "kit → adult → multi-tailed elder",
    commonInspirations: ["Vulpix", "Ninetales", "Fennekin", "Nickit"],
  },
  rodent: {
    id: "rodent",
    name: "Rodent",
    category: "Mammalian",
    description: "A plump, round-cheeked rodent with oversized ears and a curling tail. Quick and nimble, with elemental sparks, seeds, or frost clinging to its fur.",
    evolutionaryPattern: "small rodent → larger champion",
    commonInspirations: ["Pikachu", "Marill", "Pachirisu", "Dedenne"],
  },
  bat: {
    id: "bat",
    name: "Bat",
    category: "Mammalian",
    description: "A cave-dwelling creature with membrane wings and ultrasonic ears. Elemental variants may drip venom, trail shadows, or shimmer with psychic resonance.",
    evolutionaryPattern: "small bat → large apex bat",
    commonInspirations: ["Zubat", "Golbat", "Noibat", "Woobat"],
  },
  canine: {
    id: "canine",
    name: "Canine",
    category: "Mammalian",
    description: "A loyal, energetic dog with sturdy paws and an expressive tail. Elemental markings glow across its coat, and its howl can channel elemental energy.",
    evolutionaryPattern: "puppy → adult hound",
    commonInspirations: ["Growlithe", "Arcanine", "Rockruff", "Yamper"],
  },
  bear: {
    id: "bear",
    name: "Bear",
    category: "Mammalian",
    description: "A stocky, round-eared bear cub with powerful forepaws and a deceptively gentle face. Elemental auras surround it like a living weather pattern.",
    evolutionaryPattern: "cub → large adult",
    commonInspirations: ["Teddiursa", "Ursaring", "Snom", "Cubchoo"],
  },
  butterfly: {
    id: "butterfly",
    name: "Butterfly",
    category: "Insectoid",
    description: "A graceful winged insect with iridescent scale-patterned wings that scatter elemental dust with every beat. The wing patterns encode its element in vivid geometry.",
    evolutionaryPattern: "cocoon → winged adult",
    commonInspirations: ["Butterfree", "Beautifly", "Vivillon", "Ribombee"],
  },
  spider: {
    id: "spider",
    name: "Spider",
    category: "Insectoid",
    description: "An eight-legged spinner with gem-like eyes and web filaments that pulse with elemental energy. Can weave traps or cocoons that reflect its type.",
    evolutionaryPattern: "spiderling → adult spinner",
    commonInspirations: ["Spinarak", "Ariados", "Joltik", "Galvantula"],
  },
  "regional-bird": {
    id: "regional-bird",
    name: "Regional Bird",
    category: "Avian",
    description: "A common-yet-charming bird native to its locale, with a crest and wing colouration unique to its region. Often the first companion a young trainer encounters.",
    evolutionaryPattern: "chick → adult flier → apex raptor",
    commonInspirations: ["Pidgey", "Taillow", "Starly", "Rookidee"],
  },
  serpent: {
    id: "serpent",
    name: "Serpent",
    category: "Reptilian",
    description: "A sinuous, scale-armoured snake whose body ripples with elemental markings. Elemental variants glow with fire, crackle with lightning, or drip with venom.",
    evolutionaryPattern: "small snake → massive serpent",
    commonInspirations: ["Ekans", "Seviper", "Snivy", "Silicobra"],
  },
  turtle: {
    id: "turtle",
    name: "Turtle",
    category: "Reptilian",
    description: "A slow-moving armoured tortoise whose shell bears elemental carvings or growths. Sturdy and dependable, with a serene expression masking formidable defence.",
    evolutionaryPattern: "hatchling → adult fortress",
    commonInspirations: ["Squirtle", "Turtwig", "Tirtouga", "Chewtle"],
  },
  magnet: {
    id: "magnet",
    name: "Magnet",
    category: "Inorganic",
    description: "A floating magnetic object crackling with electromagnetic energy, with eyespots that track movement. Elemental variants arc with different energies — lightning, psychic, or ice.",
    evolutionaryPattern: "single magnet → cluster → levitating array",
    commonInspirations: ["Magnemite", "Magneton", "Magnezone", "Nosepass"],
  },
  weapon: {
    id: "weapon",
    name: "Weapon",
    category: "Inorganic",
    description: "A sentient bladed or blunt instrument that floats and spins with supernatural will. Ornate runes along its edge pulse with elemental power.",
    commonInspirations: ["Honedge", "Doublade", "Aegislash", "Klefki"],
  },
  mimic: {
    id: "mimic",
    name: "Mimic",
    category: "Inorganic",
    description: "A shape-shifter that disguises itself as an ordinary object — a chest, a rock, or a coin purse — until it reveals its true glowing eyes and sharp tongue.",
    commonInspirations: ["Ditto", "Mimikyu", "Sinistea", "Polteageist"],
  },
  yokai: {
    id: "yokai",
    name: "Yokai",
    category: "Mythological",
    description: "A supernatural spirit drawn from Japanese folklore, with flowing robes or fur, lantern-like eyes, and an aura of ancient mystery. Often dual-natured — mischievous yet protective.",
    evolutionaryPattern: "minor spirit → powerful deity",
    commonInspirations: ["Gastly", "Misdreavus", "Shuppet", "Yamask"],
  },
  "domestic-cat": {
    id: "domestic-cat",
    name: "Domestic Cat",
    category: "Mammalian",
    description: "A sleek house cat with retractable claws and an air of aristocratic indifference. Elemental variants may have fire-tipped tails, ice-crystal whiskers, or psychic halos.",
    evolutionaryPattern: "kitten → regal adult",
    commonInspirations: ["Meowth", "Skitty", "Glameow", "Espurr"],
  },
};
