import { Pokemon, pokemonList } from "./pokemon";

export interface Encounter {
    pokemonId: number;
    level: number;
    weight: number;
}

export const starterEncounters: Encounter[] = [

    {
        pokemonId: 1,
        level: 5,
        weight: 1
    },

    {
        pokemonId: 4,
        level: 5,
        weight: 1
    },

    {
        pokemonId: 7,
        level: 5,
        weight: 1
    }
];

export const route1Encounters: Encounter[] = [

    {
        pokemonId: 16,
        level: 3,
        weight: 20
    },

    {
        pokemonId: 19,
        level: 3,
        weight: 20
    },

    {
        pokemonId: 19,
        level: 3,
        weight: 15
    },

    {
        pokemonId: 19,
        level: 2,
        weight: 10
    },

    {
        pokemonId: 16,
        level: 2,
        weight: 10
    },

    {
        pokemonId: 16,
        level: 3,
        weight: 10
    },

    {
        pokemonId: 16,
        level: 3,
        weight: 5
    },

    {
        pokemonId: 19,
        level: 4,
        weight: 5
    },

    {
        pokemonId: 16,
        level: 4,
        weight: 4
    },

    {
        pokemonId: 16,
        level: 5,
        weight: 1
    }
];

export function chooseEncounter(
    encounters: Encounter[]
): Pokemon & { level: number } {

    const totalWeight = encounters.reduce(
        (total, encounter) => total + encounter.weight,
        0
    );

    let random = Math.floor(Math.random() * totalWeight);

    for (const encounter of encounters) {

        random -= encounter.weight;

        if (random < 0) {

            const pokemon = pokemonList.find(
                p => p.id === encounter.pokemonId
            );

            if (!pokemon) {
                throw new Error(
                    `Pokémon ${encounter.pokemonId} not found`
                );
            }

            return {
                ...pokemon,
                level: encounter.level
            };
        }
    }

    throw new Error("Encounter selection failed");
}