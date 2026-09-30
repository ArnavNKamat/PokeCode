export interface Pokemon {
    id: number;
    name: string;
    type: string;
}

export const pokemonList: Pokemon[] = [
    { id: 1, name: "Bulbasaur", type: "GRASS / POISON" },
    { id: 2, name: "Ivysaur", type: "GRASS / POISON" },
    { id: 3, name: "Venusaur", type: "GRASS / POISON" },

    { id: 4, name: "Charmander", type: "FIRE" },
    { id: 5, name: "Charmeleon", type: "FIRE" },
    { id: 6, name: "Charizard", type: "FIRE / FLYING" },

    { id: 7, name: "Squirtle", type: "WATER" },
    { id: 8, name: "Wartortle", type: "WATER" },
    { id: 9, name: "Blastoise", type: "WATER" },

    { id: 10, name: "Caterpie", type: "BUG" },
    { id: 11, name: "Metapod", type: "BUG" },
    { id: 12, name: "Butterfree", type: "BUG / FLYING" },

    { id: 13, name: "Weedle", type: "BUG / POISON" },
    { id: 14, name: "Kakuna", type: "BUG / POISON" },
    { id: 15, name: "Beedrill", type: "BUG / POISON" },

    { id: 16, name: "Pidgey", type: "NORMAL / FLYING" },
    { id: 17, name: "Pidgeotto", type: "NORMAL / FLYING" },
    { id: 18, name: "Pidgeot", type: "NORMAL / FLYING" },

    { id: 19, name: "Rattata", type: "NORMAL" },
    { id: 20, name: "Raticate", type: "NORMAL" },

    { id: 21, name: "Spearow", type: "NORMAL / FLYING" },
    { id: 22, name: "Fearow", type: "NORMAL / FLYING" },

    { id: 23, name: "Ekans", type: "POISON" },
    { id: 24, name: "Arbok", type: "POISON" },

    { id: 25, name: "Pikachu", type: "ELECTRIC" },
    { id: 26, name: "Raichu", type: "ELECTRIC" },

    { id: 27, name: "Sandshrew", type: "GROUND" },
    { id: 28, name: "Sandslash", type: "GROUND" },

    { id: 29, name: "Nidoran♀", type: "POISON" },
    { id: 30, name: "Nidorina", type: "POISON" },
    { id: 31, name: "Nidoqueen", type: "POISON / GROUND" },

    { id: 32, name: "Nidoran♂", type: "POISON" },
    { id: 33, name: "Nidorino", type: "POISON" },
    { id: 34, name: "Nidoking", type: "POISON / GROUND" },

    { id: 35, name: "Clefairy", type: "NORMAL" },
    { id: 36, name: "Clefable", type: "NORMAL" },

    { id: 37, name: "Vulpix", type: "FIRE" },
    { id: 38, name: "Ninetales", type: "FIRE" },

    { id: 39, name: "Jigglypuff", type: "NORMAL" },
    { id: 40, name: "Wigglytuff", type: "NORMAL" },

    { id: 41, name: "Zubat", type: "POISON / FLYING" },
    { id: 42, name: "Golbat", type: "POISON / FLYING" },

    { id: 43, name: "Oddish", type: "GRASS / POISON" },
    { id: 44, name: "Gloom", type: "GRASS / POISON" },
    { id: 45, name: "Vileplume", type: "GRASS / POISON" },

    { id: 46, name: "Paras", type: "BUG / GRASS" },
    { id: 47, name: "Parasect", type: "BUG / GRASS" },

    { id: 48, name: "Venonat", type: "BUG / POISON" },
    { id: 49, name: "Venomoth", type: "BUG / POISON" },

    { id: 50, name: "Diglett", type: "GROUND" },
    { id: 51, name: "Dugtrio", type: "GROUND" },

    { id: 52, name: "Meowth", type: "NORMAL" },
    { id: 53, name: "Persian", type: "NORMAL" },

    { id: 54, name: "Psyduck", type: "WATER" },
    { id: 55, name: "Golduck", type: "WATER" },

    { id: 56, name: "Mankey", type: "FIGHTING" },
    { id: 57, name: "Primeape", type: "FIGHTING" },

    { id: 58, name: "Growlithe", type: "FIRE" },
    { id: 59, name: "Arcanine", type: "FIRE" },

    { id: 60, name: "Poliwag", type: "WATER" },
    { id: 61, name: "Poliwhirl", type: "WATER" },
    { id: 62, name: "Poliwrath", type: "WATER / FIGHTING" },

    { id: 63, name: "Abra", type: "PSYCHIC" },
    { id: 64, name: "Kadabra", type: "PSYCHIC" },
    { id: 65, name: "Alakazam", type: "PSYCHIC" },

    { id: 66, name: "Machop", type: "FIGHTING" },
    { id: 67, name: "Machoke", type: "FIGHTING" },
    { id: 68, name: "Machamp", type: "FIGHTING" },

    { id: 69, name: "Bellsprout", type: "GRASS / POISON" },
    { id: 70, name: "Weepinbell", type: "GRASS / POISON" },
    { id: 71, name: "Victreebel", type: "GRASS / POISON" },

    { id: 72, name: "Tentacool", type: "WATER / POISON" },
    { id: 73, name: "Tentacruel", type: "WATER / POISON" },

    { id: 74, name: "Geodude", type: "ROCK / GROUND" },
    { id: 75, name: "Graveler", type: "ROCK / GROUND" },
    { id: 76, name: "Golem", type: "ROCK / GROUND" },

    { id: 77, name: "Ponyta", type: "FIRE" },
    { id: 78, name: "Rapidash", type: "FIRE" },

    { id: 79, name: "Slowpoke", type: "WATER / PSYCHIC" },
    { id: 80, name: "Slowbro", type: "WATER / PSYCHIC" },

    { id: 81, name: "Magnemite", type: "ELECTRIC" },
    { id: 82, name: "Magneton", type: "ELECTRIC" },

    { id: 83, name: "Farfetch'd", type: "NORMAL / FLYING" },

    { id: 84, name: "Doduo", type: "NORMAL / FLYING" },
    { id: 85, name: "Dodrio", type: "NORMAL / FLYING" },

    { id: 86, name: "Seel", type: "WATER" },
    { id: 87, name: "Dewgong", type: "WATER / ICE" },

    { id: 88, name: "Grimer", type: "POISON" },
    { id: 89, name: "Muk", type: "POISON" },

    { id: 90, name: "Shellder", type: "WATER" },
    { id: 91, name: "Cloyster", type: "WATER / ICE" },

    { id: 92, name: "Gastly", type: "GHOST / POISON" },
    { id: 93, name: "Haunter", type: "GHOST / POISON" },
    { id: 94, name: "Gengar", type: "GHOST / POISON" },

    { id: 95, name: "Onix", type: "ROCK / GROUND" },

    { id: 96, name: "Drowzee", type: "PSYCHIC" },
    { id: 97, name: "Hypno", type: "PSYCHIC" },

    { id: 98, name: "Krabby", type: "WATER" },
    { id: 99, name: "Kingler", type: "WATER" },

    { id: 100, name: "Voltorb", type: "ELECTRIC" },
    { id: 101, name: "Electrode", type: "ELECTRIC" },

    { id: 102, name: "Exeggcute", type: "GRASS / PSYCHIC" },
    { id: 103, name: "Exeggutor", type: "GRASS / PSYCHIC" },

    { id: 104, name: "Cubone", type: "GROUND" },
    { id: 105, name: "Marowak", type: "GROUND" },

    { id: 106, name: "Hitmonlee", type: "FIGHTING" },
    { id: 107, name: "Hitmonchan", type: "FIGHTING" },

    { id: 108, name: "Lickitung", type: "NORMAL" },

    { id: 109, name: "Koffing", type: "POISON" },
    { id: 110, name: "Weezing", type: "POISON" },

    { id: 111, name: "Rhyhorn", type: "GROUND / ROCK" },
    { id: 112, name: "Rhydon", type: "GROUND / ROCK" },

    { id: 113, name: "Chansey", type: "NORMAL" },
    { id: 114, name: "Tangela", type: "GRASS" },
    { id: 115, name: "Kangaskhan", type: "NORMAL" },

    { id: 116, name: "Horsea", type: "WATER" },
    { id: 117, name: "Seadra", type: "WATER" },

    { id: 118, name: "Goldeen", type: "WATER" },
    { id: 119, name: "Seaking", type: "WATER" },

    { id: 120, name: "Staryu", type: "WATER" },
    { id: 121, name: "Starmie", type: "WATER / PSYCHIC" },

    { id: 122, name: "Mr. Mime", type: "PSYCHIC" },
    { id: 123, name: "Scyther", type: "BUG / FLYING" },
    { id: 124, name: "Jynx", type: "ICE / PSYCHIC" },
    { id: 125, name: "Electabuzz", type: "ELECTRIC" },
    { id: 126, name: "Magmar", type: "FIRE" },
    { id: 127, name: "Pinsir", type: "BUG" },
    { id: 128, name: "Tauros", type: "NORMAL" },

    { id: 129, name: "Magikarp", type: "WATER" },
    { id: 130, name: "Gyarados", type: "WATER / FLYING" },

    { id: 131, name: "Lapras", type: "WATER / ICE" },
    { id: 132, name: "Ditto", type: "NORMAL" },

    { id: 133, name: "Eevee", type: "NORMAL" },
    { id: 134, name: "Vaporeon", type: "WATER" },
    { id: 135, name: "Jolteon", type: "ELECTRIC" },
    { id: 136, name: "Flareon", type: "FIRE" },

    { id: 137, name: "Porygon", type: "NORMAL" },

    { id: 138, name: "Omanyte", type: "ROCK / WATER" },
    { id: 139, name: "Omastar", type: "ROCK / WATER" },

    { id: 140, name: "Kabuto", type: "ROCK / WATER" },
    { id: 141, name: "Kabutops", type: "ROCK / WATER" },

    { id: 142, name: "Aerodactyl", type: "ROCK / FLYING" },
    { id: 143, name: "Snorlax", type: "NORMAL" },

    { id: 144, name: "Articuno", type: "ICE / FLYING" },
    { id: 145, name: "Zapdos", type: "ELECTRIC / FLYING" },
    { id: 146, name: "Moltres", type: "FIRE / FLYING" },

    { id: 147, name: "Dratini", type: "DRAGON" },
    { id: 148, name: "Dragonair", type: "DRAGON" },
    { id: 149, name: "Dragonite", type: "DRAGON / FLYING" },

    { id: 150, name: "Mewtwo", type: "PSYCHIC" },
    { id: 151, name: "Mew", type: "PSYCHIC" }
];