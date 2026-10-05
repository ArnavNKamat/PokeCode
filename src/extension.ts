import * as vscode from "vscode";
import { Pokemon, pokemonList } from "./pokemon";
import { getRandomEncounter, tryCatchGenI } from "./encounters";

const BOX_COUNT = 5;
const BOX_SIZE = 32;

interface StoredPokemon extends Pokemon {
    uid: string;
    nickname?: string;
    positionId: number;
}

interface GameState {
    seen: string[];
    caught: StoredPokemon[];
    achievements: AchievementProgress;
}

interface AchievementProgress {
    totalCaught: number;
    caughtSpecies: string[];
    unlocked: string[];
}

interface AchievementStatus {
    id: string;
    title: string;
    description: string;
    progress: number;
    target: number;
    unlocked: boolean;
}

type AchievementMetric = "catches" | "species" | "legendaries" | "mew";

const LEGENDARY_IDS = ["0144", "0145", "0146", "0150"];
const ACHIEVEMENTS: Array<{
    id: string;
    title: string;
    description: string;
    target: number;
    metric: AchievementMetric;
}> = [
    { id: "catch-1", title: "First Catch", description: "Catch your first Pokemon.", target: 1, metric: "catches" },
    { id: "catch-10", title: "Getting Started", description: "Catch 10 Pokemon.", target: 10, metric: "catches" },
    { id: "catch-100", title: "Dedicated Trainer", description: "Catch 100 Pokemon.", target: 100, metric: "catches" },
    { id: "catch-1000", title: "Master Collector", description: "Catch 1,000 Pokemon.", target: 1000, metric: "catches" },
    { id: "species-10", title: "Growing Collection", description: "Catch 10 different species.", target: 10, metric: "species" },
    { id: "species-50", title: "Kanto Specialist", description: "Catch 50 different species.", target: 50, metric: "species" },
    { id: "species-151", title: "Kanto Complete", description: "Catch all 151 Kanto species.", target: 151, metric: "species" },
    { id: "legendary-first", title: "Legendary Encounter", description: "Catch one of Kanto's Legendary Pokemon.", target: 1, metric: "legendaries" },
    { id: "legendary-all", title: "Legendary Quartet", description: "Catch all four Kanto Legendary Pokemon.", target: 4, metric: "legendaries" },
    { id: "mew", title: "Mythical Discovery", description: "Catch Mew.", target: 1, metric: "mew" }
];

export function getAchievementStatuses(
    totalCaught: number,
    caughtSpecies: string[]
): AchievementStatus[] {
    const species = new Set(caughtSpecies);
    const legendaryCount = LEGENDARY_IDS.filter(id => species.has(id)).length;

    return ACHIEVEMENTS.map(achievement => {
        let progress = 0;

        switch (achievement.metric) {
            case "catches":
                progress = totalCaught;
                break;
            case "species":
                progress = species.size;
                break;
            case "legendaries":
                progress = legendaryCount;
                break;
            case "mew":
                progress = species.has("0151") ? 1 : 0;
                break;
        }

        return {
            ...achievement,
            progress: Math.min(progress, achievement.target),
            unlocked: progress >= achievement.target
        };
    });
}

let currentPokemon: Pokemon | undefined;
let selectedBoxIndex = 0;
let provider: PokeCodeProvider | undefined;

export function activate(context: vscode.ExtensionContext) {

    provider = new PokeCodeProvider(context);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            "pokeCode.view",
            provider
        )
    );

    const command =
        vscode.commands.registerCommand(
            "poke-code.open",
            () => {

                vscode.commands.executeCommand(
                    "workbench.view.extension.pokeCode"
                );

            }
        );

    const resetDataCommand =
        vscode.commands.registerCommand(
            "poke-code.resetData",
            async () => {
                const warning =
                    await vscode.window.showWarningMessage(
                        "This will permanently delete all saved Pokédex and box progress. Continue?",
                        "Delete Progress",
                        "Cancel"
                    );

                if (warning !== "Delete Progress") {
                    return;
                }

                const confirm =
                    await vscode.window.showWarningMessage(
                        "Final confirmation: reset all saved Pokémon data?",
                        "Yes, Reset",
                        "No"
                    );

                if (confirm !== "Yes, Reset") {
                    return;
                }

                await context.globalState.update(
                    "pokeCode.gameState",
                    {
                        seen: [],
                                caught: [],
                                achievements: {
                                    totalCaught: 0,
                                    caughtSpecies: [],
                                    unlocked: []
                                }
                    }
                );

                currentPokemon = undefined;
                selectedBoxIndex = 0;

                if (provider) {
                    provider.showHome();
                }
            }
        );

    context.subscriptions.push(command, resetDataCommand);
}

class PokeCodeProvider
    implements vscode.WebviewViewProvider {

    private view?: vscode.WebviewView;
    private hasRenderedHTML = false;

    constructor(
        private readonly context: vscode.ExtensionContext
    ) {}

    resolveWebviewView(
        webviewView: vscode.WebviewView
    ) {

        this.view = webviewView;
        this.hasRenderedHTML = false;

        webviewView.webview.options = {
            enableScripts: true
        };

        webviewView.webview.onDidReceiveMessage(
            async message => {

                switch (message.command) {

                    case "home":
                        currentPokemon = undefined;
                        selectedBoxIndex = 0;
                        this.update();
                        break;

                    case "spawn":
                        spawnPokemon(this.context);
                        this.update();
                        break;

                    case "catch":
                        await catchPokemon(this.context);
                        this.update();
                        break;

                    case "run":
                        currentPokemon = undefined;
                        this.update();
                        break;

                    case "boxes":
                        this.showBoxes();
                        break;

                    case "boxes-prev":
                        selectedBoxIndex = Math.max(0, selectedBoxIndex - 1);
                        this.showBoxes();
                        break;

                    case "boxes-next":
                        selectedBoxIndex = Math.min(BOX_COUNT - 1, selectedBoxIndex + 1);
                        this.showBoxes();
                        break;

                    case "move-pokemon":
                        await movePokemon(
                            this.context,
                            message.uid,
                            Number(message.positionId)
                        );
                        this.showBoxes();
                        break;

                    case "release":
                        await releasePokemon(
                            this.context,
                            message.uid
                        );
                        this.showBoxes();
                        break;

                    case "pokedex":
                        this.showPokedex();
                        break;

                    case "achievements":
                        this.showAchievements();
                        break;

                    case "settings":
                        this.showSettings();
                        break;

                    case "credits":
                        this.showCredits();
                        break;

                    case "reset":
                        const confirmReset =
                            await vscode.window.showWarningMessage(
                                "This will permanently delete all saved Pokédex and box progress. Continue?",
                                "Delete Progress",
                                "Cancel"
                            );

                        if (confirmReset !== "Delete Progress") {
                            this.showHome();
                            break;
                        }

                        const finalConfirm =
                            await vscode.window.showWarningMessage(
                                "Final confirmation: reset all saved Pokémon data?",
                                "Yes, Reset",
                                "No"
                            );

                        if (finalConfirm !== "Yes, Reset") {
                            this.showHome();
                            break;
                        }

                        await resetAllData(this.context);
                        this.showHome();
                        break;
                }
            }
        );

        this.showHome();
    }

    private update() {

        if (!this.view) {
            return;
        }

        const state =
            getGameState(this.context);

        this.render(
            getHomeHTML(
                state,
                currentPokemon,
                this.view.webview,
                this.context.extensionUri
            )
        );
    }

    public showHome() {

        currentPokemon = undefined;
        selectedBoxIndex = 0;
        this.update();
    }

    private showBoxes() {

        if (!this.view) {
            return;
        }

        const state =
            getGameState(this.context);

        this.render(
            getBoxesHTML(
                state,
                selectedBoxIndex,
                this.view.webview,
                this.context.extensionUri
            )
        );
    }

    private showPokedex() {

        if (!this.view) {
            return;
        }

        const state =
            getGameState(this.context);

        this.render(
            getPokedexHTML(
                state,
                this.view.webview,
                this.context.extensionUri
            )
        );
    }

    private showAchievements() {
        if (!this.view) {
            return;
        }

        const state = getGameState(this.context);
        this.render(getAchievementsHTML(state));
    }

    private showSettings() {

        if (!this.view) {
            return;
        }

        this.render(getSettingsHTML());
    }

    private showCredits() {
        if (!this.view) {
            return;
        }

        this.render(getCreditsHTML());
    }

    private render(html: string) {
        if (!this.view) {
            return;
        }

        if (!this.hasRenderedHTML) {
            this.view.webview.html = html;
            this.hasRenderedHTML = true;
            return;
        }

        void this.view.webview.postMessage({ command: "render", html });
    }
}

function spawnPokemon(
    context: vscode.ExtensionContext
) {

    const pokemon =
        getRandomEncounter();

    if (!pokemon) {

        currentPokemon = undefined;

        vscode.window.showInformationMessage(
            "Nothing appeared..."
        );

        return;
    }

    currentPokemon = pokemon;

    const state = normalizeGameState(getGameState(context));

    if (!state.seen.includes(pokemon.id)) {

        state.seen.push(pokemon.id);

        void saveGameState(context, state);
    }
}

async function catchPokemon(
    context: vscode.ExtensionContext
) {

    if (!currentPokemon) {
        return;
    }

    const state = normalizeGameState(getGameState(context));

    if (state.caught.length >= BOX_COUNT * BOX_SIZE) {

        vscode.window.showWarningMessage(
            "All five Pokémon Boxes are full. Release a Pokémon first."
        );

        return;
    }

    const caught = tryCatchGenI(
        currentPokemon.catchRate,
        50,
        100,
        "POKE"
    );

    if (!caught) {

        vscode.window.showInformationMessage(
            `${currentPokemon.name} escaped!`
        );

        currentPokemon = undefined;

        return;
    }

    const inputName = await vscode.window.showInputBox({
        prompt: "Name this Pokémon",
        value: currentPokemon.name,
        placeHolder: currentPokemon.name,
        ignoreFocusOut: true,
        valueSelection: [0, currentPokemon.name.length]
    });

    const resolvedName = resolveNickname(currentPokemon, inputName);
    const previousUnlocks = new Set(state.achievements.unlocked);

    const storedPokemon: StoredPokemon = {

        ...currentPokemon,

        uid:
            `${Date.now()}-${Math.random()
                .toString(36)
                .substring(2, 9)}`,
        nickname:
            resolvedName === currentPokemon.name
                ? undefined
                : resolvedName,
        positionId: getNextOpenPositionId(state.caught)
    };

    state.caught.push(storedPokemon);
    state.achievements.totalCaught += 1;
    state.achievements.caughtSpecies = [...new Set([
        ...state.achievements.caughtSpecies,
        currentPokemon.id
    ])];

    const statuses = getAchievementStatuses(
        state.achievements.totalCaught,
        state.achievements.caughtSpecies
    );
    const newlyUnlocked = statuses.filter(
        achievement => achievement.unlocked && !previousUnlocks.has(achievement.id)
    );
    state.achievements.unlocked = statuses
        .filter(achievement => achievement.unlocked)
        .map(achievement => achievement.id);

    await saveGameState(context, state);

    if (newlyUnlocked.length > 0) {
        vscode.window.showInformationMessage(
            `${getPokemonDisplayName(storedPokemon)} was caught! Achievement unlocked: ${newlyUnlocked.map(achievement => achievement.title).join(", ")}`
        );
    } else {
        vscode.window.showInformationMessage(
            `${getPokemonDisplayName(storedPokemon)} was caught!`
        );
    }

    currentPokemon = undefined;
}

export function resolveNickname(
    pokemon: Pick<Pokemon, "name">,
    customName?: string | null
): string {
    const trimmed = customName?.trim();
    return trimmed ? trimmed : pokemon.name;
}

function getPokemonDisplayName(
    pokemon: Pick<Pokemon, "name"> & { nickname?: string }
): string {
    return pokemon.nickname ?? pokemon.name;
}

export function movePokemonToPosition<T extends { uid: string; positionId: number }>(
    caught: T[],
    uid: string,
    targetPositionId: number
): T[] {
    const source = caught.find(pokemon => pokemon.uid === uid);

    if (
        !source ||
        !Number.isInteger(targetPositionId) ||
        targetPositionId < 0 ||
        targetPositionId >= BOX_COUNT * BOX_SIZE ||
        source.positionId === targetPositionId
    ) {
        return caught;
    }

    const target = caught.find(pokemon => pokemon.positionId === targetPositionId);

    return caught.map(pokemon => {
        if (pokemon.uid === source.uid) {
            return { ...pokemon, positionId: targetPositionId };
        }

        if (target && pokemon.uid === target.uid) {
            return { ...pokemon, positionId: source.positionId };
        }

        return pokemon;
    });
}

function getNextOpenPositionId(caught: StoredPokemon[]): number {
    const occupied = new Set(caught.map(pokemon => pokemon.positionId));

    for (let positionId = 0; positionId < BOX_COUNT * BOX_SIZE; positionId++) {
        if (!occupied.has(positionId)) {
            return positionId;
        }
    }

    return -1;
}

async function movePokemon(
    context: vscode.ExtensionContext,
    uid: string,
    targetPositionId: number
) {
    const state = normalizeGameState(getGameState(context));
    const moved = movePokemonToPosition(state.caught, uid, targetPositionId);

    if (moved === state.caught) {
        return;
    }

    state.caught = moved;
    selectedBoxIndex = Math.floor(targetPositionId / BOX_SIZE);
    await saveGameState(context, state);
}

async function releasePokemon(
    context: vscode.ExtensionContext,
    uid: string
) {

    const state = normalizeGameState(getGameState(context));

    const index =
        state.caught.findIndex(
            pokemon => pokemon.uid === uid
        );

    if (index === -1) {
        return;
    }

    const pokemon =
        state.caught[index];

    const answer =
        await vscode.window.showWarningMessage(
            `Release ${getPokemonDisplayName(pokemon)}?`,
            "Release",
            "Cancel"
        );

    if (answer !== "Release") {
        return;
    }

    state.caught.splice(index, 1);

    await saveGameState(
        context,
        state
    );
}

function normalizeGameState(state?: Partial<GameState>): GameState {
    const seen = Array.isArray(state?.seen)
        ? [...new Set(state.seen.map(value => String(value)))]
        : [];

    const caught = Array.isArray(state?.caught)
        ? state.caught
            .filter((pokemon): pokemon is StoredPokemon => !!pokemon && typeof pokemon === "object")
            .slice(0, BOX_COUNT * BOX_SIZE)
        : [];
    const savedAchievements = state?.achievements;
    const savedTotalCaught = savedAchievements?.totalCaught;
    const totalCaught = Math.max(
        caught.length,
        typeof savedTotalCaught === "number" && Number.isInteger(savedTotalCaught)
            ? savedTotalCaught
            : 0
    );
    const caughtSpecies = [...new Set([
        ...(Array.isArray(savedAchievements?.caughtSpecies) ? savedAchievements.caughtSpecies : []),
        ...caught.map(pokemon => pokemon.id)
    ])];
    const unlocked = getAchievementStatuses(totalCaught, caughtSpecies)
        .filter(achievement => achievement.unlocked)
        .map(achievement => achievement.id);

    const occupied = new Set<number>();

    for (const pokemon of caught) {
        if (
            Number.isInteger(pokemon.positionId) &&
            pokemon.positionId >= 0 &&
            pokemon.positionId < BOX_COUNT * BOX_SIZE &&
            !occupied.has(pokemon.positionId)
        ) {
            occupied.add(pokemon.positionId);
        } else {
            pokemon.positionId = -1;
        }
    }

    for (const pokemon of caught) {
        if (pokemon.positionId !== -1) {
            continue;
        }

        for (let positionId = 0; positionId < BOX_COUNT * BOX_SIZE; positionId++) {
            if (!occupied.has(positionId)) {
                pokemon.positionId = positionId;
                occupied.add(positionId);
                break;
            }
        }
    }

    return {
        seen,
        caught,
        achievements: {
            totalCaught,
            caughtSpecies,
            unlocked
        }
    };
}

function getGameState(
    context: vscode.ExtensionContext
): GameState {

    const saved = context.globalState.get<Partial<GameState>>(
        "pokeCode.gameState",
        {
            seen: [],
            caught: [],
            achievements: {
                totalCaught: 0,
                caughtSpecies: [],
                unlocked: []
            }
        }
    );

    const normalized = normalizeGameState(saved);

    if (JSON.stringify(saved) !== JSON.stringify(normalized)) {
        void context.globalState.update("pokeCode.gameState", normalized);
    }

    return normalized;
}

async function saveGameState(
    context: vscode.ExtensionContext,
    state: GameState
) {

    return context.globalState.update(
        "pokeCode.gameState",
        state
    );
}

async function resetAllData(
    context: vscode.ExtensionContext
) {
    await context.globalState.update(
        "pokeCode.gameState",
        {
            seen: [],
            caught: [],
            achievements: {
                totalCaught: 0,
                caughtSpecies: [],
                unlocked: []
            }
        }
    );

    currentPokemon = undefined;
    selectedBoxIndex = 0;
}

function getMediaURL(
    webview: vscode.Webview,
    extensionUri: vscode.Uri,
    filename: string
): string {
    return webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, "media", filename)
    ).toString();
}

function getSpriteURL(
    webview: vscode.Webview,
    extensionUri: vscode.Uri,
    id: string | number
): string {
    const filename = `${String(Number(id)).padStart(4, "0")}.png`;

    return getMediaURL(webview, extensionUri, filename);
}

function getHomeHTML(
    state: GameState,
    pokemon: Pokemon | undefined,
    webview: vscode.Webview,
    extensionUri: vscode.Uri
): string {

    let content = "";

    if (pokemon) {

        content = `

        <div class="encounter">

            <img
                src="${getSpriteURL(webview, extensionUri, pokemon.id)}"
                class="pokemon"
            >

            <h2>${pokemon.name}</h2>

            <p>${pokemon.type}</p>

            <button onclick="send('catch')">
                Catch
            </button>

            <button onclick="send('run')">
                Run
            </button>

        </div>

        `;

    } else {

        content = `

        <div class="homeBall">

            <img
                src="${getMediaURL(webview, extensionUri, "pokeball.png")}"
                class="pokeball"
                onclick="send('spawn')"
            >

            <h2>Open Poké Ball</h2>

            <p>
                Click the Poké Ball to look for a Pokémon.
            </p>

        </div>

        `;
    }

    return page(

        "PokeCode",

        `

        ${content}

        <div class="stats">

            <div>
                <b>${state.seen.length}</b>
                <small>Seen</small>
            </div>

            <div>
                <b>${state.caught.length}</b>
                <small>Caught</small>
            </div>

            <div>
                <b>${BOX_COUNT * BOX_SIZE}</b>
                <small>Slots</small>
            </div>

        </div>

        <div class="menu">

            <button onclick="send('boxes')">
                <span class="menuIcon" aria-hidden="true" style="--menu-icon: url('${getMediaURL(webview, extensionUri, "nav-boxes.png")}')"></span>
                <span>Boxes</span>
            </button>

            <button onclick="send('pokedex')">
                <span class="menuIcon" aria-hidden="true" style="--menu-icon: url('${getMediaURL(webview, extensionUri, "nav-pokedex.png")}')"></span>
                <span>Pokédex</span>
            </button>

            <button onclick="send('achievements')">
                <span class="menuIcon" aria-hidden="true" style="--menu-icon: url('${getMediaURL(webview, extensionUri, "nav-achievements.png")}')"></span>
                <span>Achievements</span>
            </button>

            <button onclick="send('settings')">
                <span class="menuIcon" aria-hidden="true" style="--menu-icon: url('${getMediaURL(webview, extensionUri, "nav-settings.png")}')"></span>
                <span>Settings</span>
            </button>

        </div>

        `
    );
}

function getBoxesHTML(
    state: GameState,
    currentBoxIndex: number,
    webview: vscode.Webview,
    extensionUri: vscode.Uri
): string {

    const safeIndex = Math.max(0, Math.min(BOX_COUNT - 1, currentBoxIndex));
    const start = safeIndex * BOX_SIZE;
    const pokemonByPosition = new Map(
        state.caught.map(pokemon => [pokemon.positionId, pokemon])
    );

    let slots = "";

    for (
        let slot = 0;
        slot < BOX_SIZE;
        slot++
    ) {

        const positionId = start + slot;
        const pokemon = pokemonByPosition.get(positionId);

        if (pokemon) {

            const displayName = getPokemonDisplayName(pokemon);

            slots += `

            <div
                id="position-${positionId}"
                class="slot occupiedSlot"
                onclick="choosePosition(${positionId})"
                title="Position ${positionId + 1}"
            >

                <img
                    src="${getSpriteURL(webview, extensionUri, pokemon.id)}"
                >

                <span>
                    ${displayName}
                </span>

                <button
                    class="release"
                    onclick="releasePokemon(event, '${pokemon.uid}')"
                >
                    Release
                </button>

                <button
                    class="move"
                    onclick="beginMove(event, '${pokemon.uid}')"
                >
                    Move
                </button>

            </div>

            `;

        } else {

            slots += `

            <div
                id="position-${positionId}"
                class="slot emptySlot"
                onclick="choosePosition(${positionId})"
                title="Position ${positionId + 1}"
            >
                Empty
            </div>

            `;
        }
    }

    return page(

        "Pokémon Boxes",

        `

        <button onclick="send('home')">
            ← Home
        </button>

        <div class="boxNav">
            <button onclick="send('boxes-prev')" ${safeIndex === 0 ? "disabled" : ""}>Previous</button>
            <span>Box ${safeIndex + 1} / ${BOX_COUNT}</span>
            <button onclick="send('boxes-next')" ${safeIndex === BOX_COUNT - 1 ? "disabled" : ""}>Next</button>
        </div>

        <p>
            ${state.caught.length}
            / ${BOX_COUNT * BOX_SIZE}
            Pokémon stored
        </p>

        <p id="moveStatus" class="moveStatus" hidden>
            Choose a destination slot. Occupied slots will swap.
        </p>

        <h3>
            Box ${safeIndex + 1}
        </h3>

        <div class="box">
            ${slots}
        </div>

        `
    );
}

function getPokedexHTML(
    state: GameState,
    webview: vscode.Webview,
    extensionUri: vscode.Uri
): string {

    const seenPokemon =
        pokemonList.filter(
            entry => state.seen.includes(entry.id)
        );

    const entries = seenPokemon.map(
        entry => `

        <div class="dexEntry">

            <img src="${getSpriteURL(webview, extensionUri, entry.id)}">

            <span>
                #${entry.id}
            </span>

            <b>
                ${entry.name}
            </b>

        </div>

        `
    ).join("");

    return page(

        "Pokédex",

        `

        <button onclick="send('home')">
            ← Home
        </button>

        <p>
            Seen ${state.seen.length} / 151
        </p>

        <div class="dex">
            ${entries || "<p>No Pokémon seen yet.</p>"}
        </div>

        `
    );
}

function getSettingsHTML(): string {
    return page(
        "Settings",
        `
        <button onclick="send('home')">
            ← Home
        </button>

        <button onclick="send('credits')">
            Credits
        </button>

        <button class="reset" onclick="send('reset')">
            Reset Data
        </button>
        `
    );
}

function getCreditsHTML(): string {
    return page(
        "Credits",
        `
        <button onclick="send('settings')">
            ← Settings
        </button>

        <section class="credits">
            <h2>Developer</h2>
            <p><a href="https://github.com/ArnavNkamat">GitHub: ArnavNkamat</a></p>

            <h2>Pokémon</h2>
            <p>Pokémon names, characters, and related trademarks belong to Nintendo, Creatures Inc., GAME FREAK inc., and The Pokémon Company. PokeCode is an unofficial fan project and is not affiliated with or endorsed by them.</p>
            <p>Generation I catch-rate values are based on Pokémon Red and Blue.</p>
            <p>Bundled Pokémon sprites are sourced from the <a href="https://github.com/PokeAPI/sprites">PokeAPI sprites repository</a>.</p>

            <h2>Interface Icons</h2>
            <p>Navigation icons are from <a href="https://github.com/google/material-design-icons">Google Material Design Icons</a>, licensed under Apache 2.0.</p>
        </section>
        `
    );
}

function getAchievementsHTML(state: GameState): string {
    const achievements = getAchievementStatuses(
        state.achievements.totalCaught,
        state.achievements.caughtSpecies
    );
    const unlockedCount = achievements.filter(achievement => achievement.unlocked).length;
    const entries = achievements.map(achievement => `
        <div class="achievement ${achievement.unlocked ? "unlocked" : ""}">
            <div class="achievementHeading">
                <b>${achievement.title}</b>
                <span>${achievement.unlocked ? "Unlocked" : achievement.progress + " / " + achievement.target}</span>
            </div>
            <p>${achievement.description}</p>
            <progress value="${achievement.progress}" max="${achievement.target}" aria-label="${achievement.title} progress"></progress>
        </div>
    `).join("");

    return page(
        "Achievements",
        `
        <button onclick="send('home')">
            ← Home
        </button>

        <p>${unlockedCount} / ${achievements.length} unlocked</p>

        <div class="achievementList">
            ${entries}
        </div>
        `
    );
}

function page(
    title: string,
    content: string
): string {

    return `

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<style>

body {
    color: var(--vscode-foreground);
    background: var(--vscode-sideBar-background);
    font-family: var(--vscode-font-family);
    padding: 12px;
}

h1 {
    text-align: center;
    margin-bottom: 20px;
}

h3 {
    text-align: center;
}

button {
    width: 100%;
    padding: 8px;
    margin: 4px 0;
    border: none;
    border-radius: 5px;
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    cursor: pointer;
}

button:hover {
    background: var(--vscode-button-hoverBackground);
}

.homeBall {
    text-align: center;
    padding: 25px 0;
}

.pokeball {
    width: 90px;
    cursor: pointer;
    image-rendering: pixelated;
    transition: transform 0.2s;
}

.pokeball:hover {
    transform: scale(1.1);
}

.encounter {
    text-align: center;
    padding: 15px;
}

.pokemon {
    width: 150px;
    height: 150px;
    object-fit: contain;
    image-rendering: pixelated;
}

.stats {
    display: flex;
    gap: 5px;
    margin: 15px 0;
}

.stats div {
    flex: 1;
    text-align: center;
    background: var(--vscode-editor-background);
    padding: 8px;
    border-radius: 5px;
}

.stats b,
.stats small {
    display: block;
}

.menu {
    margin-top: 15px;
}

.menu button {
    display: flex;
    align-items: center;
    gap: 10px;
    text-align: left;
}

.menuIcon {
    width: 24px;
    height: 24px;
    flex: 0 0 24px;
    background-color: var(--vscode-foreground);
    -webkit-mask: var(--menu-icon) center / contain no-repeat;
    mask: var(--menu-icon) center / contain no-repeat;
}

.reset {
    margin-top: 20px;
    opacity: 0.7;
}

.settingsBox {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin: 16px 0;
}

.settingRow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    background: var(--vscode-editor-background);
    padding: 10px;
    border-radius: 6px;
}

.settingRow input[type="checkbox"] {
    width: 18px;
    height: 18px;
}

.settingRow input[type="range"] {
    width: 120px;
}

.box {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 4px;
    margin-bottom: 20px;
}

.slot {
    min-height: 75px;
    background: var(--vscode-editor-background);
    border-radius: 4px;
    text-align: center;
    padding: 3px;
    overflow: hidden;
    cursor: pointer;
}

.slot:hover {
    outline: 1px solid var(--vscode-focusBorder);
}

.slot img {
    width: 42px;
    height: 42px;
    object-fit: contain;
    image-rendering: pixelated;
}

.slot span {
    display: block;
    font-size: 9px;
    overflow: hidden;
    white-space: nowrap;
}

.emptySlot {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    opacity: 0.4;
}

.release {
    font-size: 8px;
    padding: 2px;
    margin: 2px 0 0;
}

.move {
    font-size: 8px;
    padding: 2px;
    margin: 2px 0 0;
}

.moveStatus {
    padding: 8px;
    background: var(--vscode-editor-background);
}

.achievementList {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.achievement {
    padding: 10px;
    background: var(--vscode-editor-background);
    border-left: 3px solid var(--vscode-disabledForeground);
}

.achievement.unlocked {
    border-left-color: var(--vscode-testing-iconPassed);
}

.achievementHeading {
    display: flex;
    justify-content: space-between;
    gap: 8px;
}

.achievementHeading span {
    opacity: 0.7;
    white-space: nowrap;
}

.achievement p {
    margin: 6px 0;
}

.achievement progress {
    width: 100%;
    height: 8px;
}

.credits {
    line-height: 1.45;
}

.credits a {
    color: var(--vscode-textLink-foreground);
}

.dex {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.dexEntry {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--vscode-editor-background);
    padding: 5px;
    border-radius: 4px;
}

.dexEntry img {
    width: 40px;
    height: 40px;
    image-rendering: pixelated;
}

.dexEntry span {
    opacity: 0.6;
    font-size: 11px;
}

</style>

</head>

<body>

<div id="app">
<h1>${title}</h1>

${content}
</div>

<script>

const vscode = acquireVsCodeApi();
let selectedMoveUid = null;

function send(command, payload = {}) {

    vscode.postMessage({
        command: command,
        ...payload
    });

}

function releasePokemon(event, uid) {
    event.stopPropagation();

    vscode.postMessage({
        command: "release",
        uid: uid
    });

}

function beginMove(event, uid) {
    event.stopPropagation();
    selectedMoveUid = uid;
    updateMoveStatus();
}

function choosePosition(positionId) {
    if (!selectedMoveUid) {
        return;
    }

    send("move-pokemon", {
        uid: selectedMoveUid,
        positionId: positionId
    });
    selectedMoveUid = null;
    updateMoveStatus();
}

function updateMoveStatus() {
    const status = document.getElementById("moveStatus");
    if (status) {
        status.hidden = !selectedMoveUid;
    }
}

window.addEventListener("message", event => {
    if (event.data.command !== "render" || typeof event.data.html !== "string") {
        return;
    }

    const nextDocument = new DOMParser().parseFromString(event.data.html, "text/html");
    const nextApp = nextDocument.getElementById("app");
    const app = document.getElementById("app");
    if (!nextApp || !app) {
        return;
    }

    app.innerHTML = nextApp.innerHTML;
    document.title = nextDocument.title;
    updateMoveStatus();
});

</script>

</body>

</html>

`;
}

export function deactivate() {

    currentPokemon = undefined;
    provider = undefined;

}