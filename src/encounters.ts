import { Pokemon, pokemonList } from "./pokemon";

export function getRandomEncounter(): Pokemon | undefined {

    /*
     * Some attempts produce no encounter.
     */

    if (Math.random() < 0.25) {
        return undefined;
    }

    const index =
        Math.floor(
            Math.random() * pokemonList.length
        );

    return {
        ...pokemonList[index]
    };
}