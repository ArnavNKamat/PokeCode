import { Pokemon, pokemonList } from "./pokemon";

export type BallType = "POKE" | "GREAT" | "ULTRA" | "MASTER";

export function ballMultiplier(ball: BallType): number {
    switch (ball) {
        case "GREAT":
            return 1.5;
        case "ULTRA":
            return 2.0;
        case "MASTER":
            return Number.POSITIVE_INFINITY;
        default:
            return 1.0;
    }
}

export function tryCatchGenI(
    catchRate: number,
    currentHP: number,
    maxHP: number,
    ball: BallType = "POKE"
): boolean {
    if (ball === "MASTER") {
        return true;
    }

    if (catchRate <= 0) {
        return false;
    }

    if (catchRate >= 255) {
        return true;
    }

    const hpFactor = (3 * maxHP - 2 * currentHP) / (3 * maxHP);
    const catchValue = Math.min(
        255,
        Math.max(0, catchRate * ballMultiplier(ball) * hpFactor)
    );

    const roll = Math.floor(Math.random() * 256);

    return roll < catchValue;
}

const ENCOUNTER_CHANCE = 0.75;

export function getRandomEncounter(): Pokemon | undefined {
    if (Math.random() > ENCOUNTER_CHANCE) {
        return undefined;
    }

    const index = Math.floor(Math.random() * pokemonList.length);

    return {
        ...pokemonList[index]
    };
}