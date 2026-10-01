import * as vscode from "vscode";
import { Pokemon } from "./pokemon";
import { getRandomEncounter } from "./encounters";

const BOX_COUNT = 5;
const BOX_SIZE = 32;

interface StoredPokemon extends Pokemon {
    uid: string;
}

interface GameState {
    seen: number[];
    caught: StoredPokemon[];
}

let currentPokemon: Pokemon | undefined;

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

    context.subscriptions.push(command);
}

class PokeCodeProvider
    implements vscode.WebviewViewProvider {

    private view?: vscode.WebviewView;

    constructor(
        private readonly context: vscode.ExtensionContext
    ) {}

    resolveWebviewView(
        webviewView: vscode.WebviewView
    ) {

        this.view = webviewView;

        webviewView.webview.options = {
            enableScripts: true
        };

        webviewView.webview.onDidReceiveMessage(
            async message => {

                switch (message.command) {

                    case "home":
                        currentPokemon = undefined;
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

                    case "reset":

                        const answer =
                            await vscode.window.showWarningMessage(
                                "Reset all PokeCode data?",
                                "Reset",
                                "Cancel"
                            );

                        if (answer === "Reset") {

                            await this.context.globalState.update(
                                "pokeCode.gameState",
                                {
                                    seen: [],
                                    caught: []
                                }
                            );

                            currentPokemon = undefined;

                            this.showHome();
                        }

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

        this.view.webview.html =
            getHomeHTML(state, currentPokemon);
    }

    private showHome() {

        currentPokemon = undefined;
        this.update();
    }

    private showBoxes() {

        if (!this.view) {
            return;
        }

        const state =
            getGameState(this.context);

        this.view.webview.html =
            getBoxesHTML(state);
    }

    private showPokedex() {

        if (!this.view) {
            return;
        }

        const state =
            getGameState(this.context);

        this.view.webview.html =
            getPokedexHTML(state);
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

    const state =
        getGameState(context);

    if (!state.seen.includes(pokemon.id)) {

        state.seen.push(pokemon.id);

        saveGameState(context, state);
    }
}

async function catchPokemon(
    context: vscode.ExtensionContext
) {

    if (!currentPokemon) {
        return;
    }

    const state =
        getGameState(context);

    if (state.caught.length >= BOX_COUNT * BOX_SIZE) {

        vscode.window.showWarningMessage(
            "All five Pokémon Boxes are full. Release a Pokémon first."
        );

        return;
    }

    /*
     * Catch rate is checked here,
     * not when the Pokémon appears.
     */

    const catchRoll =
        Math.floor(Math.random() * 256);

    if (catchRoll >= currentPokemon.catchRate) {

        vscode.window.showInformationMessage(
            `${currentPokemon.name} escaped!`
        );

        currentPokemon = undefined;

        return;
    }

    const storedPokemon: StoredPokemon = {

        ...currentPokemon,

        uid:
            `${Date.now()}-${Math.random()
                .toString(36)
                .substring(2, 9)}`
    };

    /*
     * Every caught Pokémon gets
     * its own entry.
     *
     * Therefore duplicates are allowed.
     */

    state.caught.push(storedPokemon);

    saveGameState(context, state);

    vscode.window.showInformationMessage(
        `${currentPokemon.name} was caught!`
    );

    currentPokemon = undefined;
}

async function releasePokemon(
    context: vscode.ExtensionContext,
    uid: string
) {

    const state =
        getGameState(context);

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
            `Release ${pokemon.name}?`,
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

function getGameState(
    context: vscode.ExtensionContext
): GameState {

    return context.globalState.get<GameState>(
        "pokeCode.gameState",
        {
            seen: [],
            caught: []
        }
    );
}

function saveGameState(
    context: vscode.ExtensionContext,
    state: GameState
) {

    return context.globalState.update(
        "pokeCode.gameState",
        state
    );
}

function getSpriteURL(
    id: number
): string {

    /*
     * Transparent official-style sprite.
     */

    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

function getHomeHTML(
    state: GameState,
    pokemon?: Pokemon
): string {

    let content = "";

    if (pokemon) {

        content = `

        <div class="encounter">

            <img
                src="${getSpriteURL(pokemon.id)}"
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
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
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
                📦 Boxes
            </button>

            <button onclick="send('pokedex')">
                📖 Pokédex
            </button>

        </div>

        <button
            class="reset"
            onclick="send('reset')"
        >
            Reset Data
        </button>

        `
    );
}

function getBoxesHTML(
    state: GameState
): string {

    let boxes = "";

    for (
        let boxNumber = 0;
        boxNumber < BOX_COUNT;
        boxNumber++
    ) {

        const start =
            boxNumber * BOX_SIZE;

        const pokemonInBox =
            state.caught.slice(
                start,
                start + BOX_SIZE
            );

        let slots = "";

        for (
            let slot = 0;
            slot < BOX_SIZE;
            slot++
        ) {

            const pokemon =
                pokemonInBox[slot];

            if (pokemon) {

                slots += `

                <div class="slot">

                    <img
                        src="${getSpriteURL(pokemon.id)}"
                    >

                    <span>
                        ${pokemon.name}
                    </span>

                    <button
                        class="release"
                        onclick="releasePokemon('${pokemon.uid}')"
                    >
                        Release
                    </button>

                </div>

                `;

            } else {

                slots += `

                <div class="slot emptySlot">
                    Empty
                </div>

                `;
            }
        }

        boxes += `

        <h3>
            Box ${boxNumber + 1}
        </h3>

        <div class="box">
            ${slots}
        </div>

        `;
    }

    return page(

        "Pokémon Boxes",

        `

        <button onclick="send('home')">
            ← Home
        </button>

        <p>
            ${state.caught.length}
            / ${BOX_COUNT * BOX_SIZE}
            Pokémon stored
        </p>

        ${boxes}

        `
    );
}

function getPokedexHTML(
    state: GameState
): string {

    let entries = "";

    for (let i = 1; i <= 151; i++) {

        if (state.seen.includes(i)) {

            entries += `

            <div class="dexEntry">

                <img src="${getSpriteURL(i)}">

                <span>
                    #${String(i).padStart(3, "0")}
                </span>

                <b>
                    ${getPokemonName(i)}
                </b>

            </div>

            `;

        }
    }

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

function getPokemonName(
    id: number
): string {

    /*
     * The encounter data already contains
     * Pokémon names. This fallback is only
     * for Pokédex entries.
     */

    const names = [
        "Bulbasaur",
        "Ivysaur",
        "Venusaur",
        "Charmander",
        "Charmeleon",
        "Charizard",
        "Squirtle",
        "Wartortle",
        "Blastoise"
    ];

    return names[id - 1] || `Pokémon #${id}`;
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

h2,
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

.reset {
    margin-top: 20px;
    opacity: 0.7;
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

<h1>${title}</h1>

${content}

<script>

const vscode = acquireVsCodeApi();

function send(command) {

    vscode.postMessage({
        command: command
    });

}

function releasePokemon(uid) {

    vscode.postMessage({
        command: "release",
        uid: uid
    });

}

</script>

</body>

</html>

`;
}

export function deactivate() {

    currentPokemon = undefined;
    provider = undefined;

}