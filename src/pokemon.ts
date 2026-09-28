export interface Pokemon {
    id: number;
    name: string;
    type: string;
    baseHp: number;
    catchRate: number;
}

export const pokemonList: Pokemon[] = [

    {
        id: 1,
        name: "Bulbasaur",
        type: "GRASS / POISON",
        baseHp: 45,
        catchRate: 45
    },

    {
        id: 4,
        name: "Charmander",
        type: "FIRE",
        baseHp: 39,
        catchRate: 45
    },

    {
        id: 7,
        name: "Squirtle",
        type: "WATER",
        baseHp: 44,
        catchRate: 45
    },

    {
        id: 16,
        name: "Pidgey",
        type: "NORMAL / FLYING",
        baseHp: 40,
        catchRate: 255
    },

    {
        id: 19,
        name: "Rattata",
        type: "NORMAL",
        baseHp: 30,
        catchRate: 255
    }
];