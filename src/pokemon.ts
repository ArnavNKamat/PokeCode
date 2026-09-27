export interface Pokemon {
    id: number;
    name: string;
    type: string;
    baseHp: number;
    baseAttack: number;
    baseDefense: number;
    baseSpeed: number;
    catchRate: number;
}

export const pokemonList: Pokemon[] = [
    {
        id: 1,
        name: "BULBASAUR",
        type: "GRASS/POISON",
        baseHp: 45,
        baseAttack: 49,
        baseDefense: 49,
        baseSpeed: 45,
        catchRate: 45
    },

    {
        id: 4,
        name: "CHARMANDER",
        type: "FIRE",
        baseHp: 39,
        baseAttack: 52,
        baseDefense: 43,
        baseSpeed: 65,
        catchRate: 45
    },

    {
        id: 7,
        name: "SQUIRTLE",
        type: "WATER",
        baseHp: 44,
        baseAttack: 48,
        baseDefense: 65,
        baseSpeed: 43,
        catchRate: 45
    },

    {
        id: 10,
        name: "CATERPIE",
        type: "BUG",
        baseHp: 45,
        baseAttack: 30,
        baseDefense: 35,
        baseSpeed: 45,
        catchRate: 255
    },

    {
        id: 13,
        name: "WEEDLE",
        type: "BUG/POISON",
        baseHp: 40,
        baseAttack: 35,
        baseDefense: 30,
        baseSpeed: 50,
        catchRate: 255
    },

    {
        id: 16,
        name: "PIDGEY",
        type: "NORMAL/FLYING",
        baseHp: 40,
        baseAttack: 45,
        baseDefense: 40,
        baseSpeed: 56,
        catchRate: 255
    },

    {
        id: 19,
        name: "RATTATA",
        type: "NORMAL",
        baseHp: 30,
        baseAttack: 56,
        baseDefense: 35,
        baseSpeed: 72,
        catchRate: 255
    },

    {
        id: 25,
        name: "PIKACHU",
        type: "ELECTRIC",
        baseHp: 35,
        baseAttack: 55,
        baseDefense: 30,
        baseSpeed: 90,
        catchRate: 190
    },

    {
        id: 41,
        name: "ZUBAT",
        type: "POISON/FLYING",
        baseHp: 40,
        baseAttack: 45,
        baseDefense: 35,
        baseSpeed: 55,
        catchRate: 255
    },

    {
        id: 74,
        name: "GEODUDE",
        type: "ROCK/GROUND",
        baseHp: 40,
        baseAttack: 80,
        baseDefense: 100,
        baseSpeed: 20,
        catchRate: 255
    }
];