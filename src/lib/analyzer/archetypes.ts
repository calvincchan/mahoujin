export const ARCHETYPE_BLUEPRINT_KEYS = [
  "caterpillar",
  "fox",
  "rodent",
  "bat",
  "canine",
  "bear",
  "butterfly",
  "spider",
  "regional-bird",
  "serpent",
  "turtle",
  "magnet",
  "weapon",
  "mimic",
  "yokai",
  "domestic-cat",
  "mysterious",
] as const;

export type ArchetypeCategory =
  | "Mammalian"
  | "Insectoid"
  | "Avian"
  | "Reptilian"
  | "Inorganic"
  | "Mythological";

export type ArchetypeBlueprint = (typeof ARCHETYPE_BLUEPRINT_KEYS)[number];

export interface PokemonArchetype {
  id: ArchetypeBlueprint;
  name: string;
  category: ArchetypeCategory;
  description: string;
  commonInspirations: string[];
}

export const ARCHETYPE_REGISTRY: Record<ArchetypeBlueprint, PokemonArchetype> = {
  caterpillar: {
    id: "caterpillar",
    name: "Caterpillar",
    category: "Insectoid",
    description: "A small, segmented larval creature with large expressive eyes and stubby legs. Often sports a colourful body pattern that hints at its eventual evolved form.",
    commonInspirations: ["Caterpie", "Weedle", "Wurmple", "Scatterbug", "Sewaddle", "Grubbin", "Blipbug", "Tarountula", "Nincada", "Spinarak"],
  },
  fox: {
    id: "fox",
    name: "Fox",
    category: "Mammalian",
    description: "A lithe, sharp-eared fox spirit with a bushy tail and cunning gaze. Elemental variants alter fur colour and tail count, hinting at spiritual power.",
    commonInspirations: ["Vulpix", "Ninetales", "Fennekin", "Nickit", "Thievul", "Zorua", "Zoroark", "Eevee", "Braixen", "Delphox"],
  },
  rodent: {
    id: "rodent",
    name: "Rodent",
    category: "Mammalian",
    description: "A plump, round-cheeked rodent with oversized ears and a curling tail. Quick and nimble, with elemental sparks, seeds, or frost clinging to its fur.",
    commonInspirations: ["Pikachu", "Marill", "Pachirisu", "Dedenne", "Togedemaru", "Morpeko", "Emolga", "Minccino", "Raichu", "Azumarill"],
  },
  bat: {
    id: "bat",
    name: "Bat",
    category: "Mammalian",
    description: "A cave-dwelling creature with membrane wings and ultrasonic ears. Elemental variants may drip venom, trail shadows, or shimmer with psychic resonance.",
    commonInspirations: ["Zubat", "Golbat", "Noibat", "Woobat", "Swoobat", "Crobat", "Noivern", "Gliscor", "Gligar", "Lunala"],
  },
  canine: {
    id: "canine",
    name: "Canine",
    category: "Mammalian",
    description: "A loyal, energetic dog with sturdy paws and an expressive tail. Elemental markings glow across its coat, and its howl can channel elemental energy.",
    commonInspirations: ["Growlithe", "Arcanine", "Rockruff", "Yamper", "Boltund", "Furfrou", "Houndour", "Houndoom", "Electrike", "Manectric"],
  },
  bear: {
    id: "bear",
    name: "Bear",
    category: "Mammalian",
    description: "A stocky, round-eared bear cub with powerful forepaws and a deceptively gentle face. Elemental auras surround it like a living weather pattern.",
    commonInspirations: ["Teddiursa", "Ursaring", "Snom", "Cubchoo", "Beartic", "Pancham", "Pangoro", "Stufful", "Bewear", "Frigibax"],
  },
  butterfly: {
    id: "butterfly",
    name: "Butterfly",
    category: "Insectoid",
    description: "A graceful winged insect with iridescent scale-patterned wings that scatter elemental dust with every beat. The wing patterns encode its element in vivid geometry.",
    commonInspirations: ["Butterfree", "Beautifly", "Vivillon", "Ribombee", "Venomoth", "Dustox", "Mothim", "Volcarona", "Flygon", "Masquerain"],
  },
  spider: {
    id: "spider",
    name: "Spider",
    category: "Insectoid",
    description: "An eight-legged spinner with gem-like eyes and web filaments that pulse with elemental energy. Can weave traps or cocoons that reflect its type.",
    commonInspirations: ["Spinarak", "Ariados", "Joltik", "Galvantula", "Dewpider", "Araquanid", "Surskit", "Masquerain", "Orbeetle", "Frosmoth"],
  },
  "regional-bird": {
    id: "regional-bird",
    name: "Regional Bird",
    category: "Avian",
    description: "A common-yet-charming bird native to its locale, with a crest and wing colouration unique to its region. Often the first companion a young trainer encounters.",
    commonInspirations: ["Pidgey", "Taillow", "Starly", "Rookidee", "Fletchling", "Pikipek", "Wooloo", "Squawkabilly", "Pidove", "Chatot"],
  },
  serpent: {
    id: "serpent",
    name: "Serpent",
    category: "Reptilian",
    description: "A sinuous, scale-armoured snake whose body ripples with elemental markings. Elemental variants glow with fire, crackle with lightning, or drip with venom.",
    commonInspirations: ["Ekans", "Seviper", "Snivy", "Silicobra", "Arbok", "Serperior", "Sandaconda", "Dragonair", "Milotic", "Gyarados"],
  },
  turtle: {
    id: "turtle",
    name: "Turtle",
    category: "Reptilian",
    description: "A slow-moving armoured tortoise whose shell bears elemental carvings or growths. Sturdy and dependable, with a serene expression masking formidable defence.",
    commonInspirations: ["Squirtle", "Turtwig", "Tirtouga", "Chewtle", "Wartortle", "Blastoise", "Carracosta", "Drednaw", "Torkoal", "Shuckle"],
  },
  magnet: {
    id: "magnet",
    name: "Magnet",
    category: "Inorganic",
    description: "A floating magnetic object crackling with electromagnetic energy, with eyespots that track movement. Elemental variants arc with different energies — lightning, psychic, or ice.",
    commonInspirations: ["Magnemite", "Magneton", "Magnezone", "Nosepass", "Probopass", "Klink", "Klang", "Klinklang", "Rotom", "Vikavolt"],
  },
  weapon: {
    id: "weapon",
    name: "Weapon",
    category: "Inorganic",
    description: "A sentient bladed or blunt instrument that floats and spins with supernatural will. Ornate runes along its edge pulse with elemental power.",
    commonInspirations: ["Honedge", "Doublade", "Aegislash", "Klefki", "Kartana", "Pawniard", "Bisharp", "Kingambit", "Excadrill", "Escavalier"],
  },
  mimic: {
    id: "mimic",
    name: "Mimic",
    category: "Inorganic",
    description: "A shape-shifter that disguises itself as an ordinary object — a chest, a rock, or a coin purse — until it reveals its true glowing eyes and sharp tongue.",
    commonInspirations: ["Ditto", "Mimikyu", "Sinistea", "Polteageist", "Morpeko", "Rotom", "Zoroark", "Kecleon", "Castform", "Mew"],
  },
  yokai: {
    id: "yokai",
    name: "Yokai",
    category: "Mythological",
    description: "A supernatural spirit drawn from Japanese folklore, with flowing robes or fur, lantern-like eyes, and an aura of ancient mystery. Often dual-natured — mischievous yet protective.",
    commonInspirations: ["Gastly", "Misdreavus", "Shuppet", "Yamask", "Litwick", "Phantump", "Pumpkaboo", "Decidueye", "Froslass", "Galarian Corsola"],
  },
  "domestic-cat": {
    id: "domestic-cat",
    name: "Domestic Cat",
    category: "Mammalian",
    description: "A sleek house cat with retractable claws and an air of aristocratic indifference. Elemental variants may have fire-tipped tails, ice-crystal whiskers, or psychic halos.",
    commonInspirations: ["Meowth", "Skitty", "Glameow", "Espurr", "Purrloin", "Liepard", "Meowstic", "Delcatty", "Incineroar", "Sprigatito"],
  },
  mysterious: {
    id: "mysterious",
    name: "Mysterious",
    category: "Mythological",
    description: "A stellar entity of unknown origin, shimmering with cosmic energy and starlight. Its form shifts between states — sometimes solid, sometimes translucent — as though existing in multiple dimensions at once.",
    commonInspirations: ["Cosmog", "Jirachi", "Clefairy", "Mew", "Celebi", "Victini", "Manaphy", "Shaymin", "Deoxys", "Eternatus"],
  },
};
