import { Pokemon, pokemonList } from "./pokemon";

export function getRandomEncounter(): Pokemon | undefined {

    // 20% chance that nothing appears
    if (Math.random() < 0.20) {
        return undefined;
    }

    const index =
        Math.floor(
            Math.random() * pokemonList.length
        );

    return pokemonList[index];
}