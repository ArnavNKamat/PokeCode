import * as vscode from "vscode";

import { Pokemon, pokemonList } from "./pokemon";
import { getRandomEncounter } from "./encounters";

interface GameState {
    seen: number[];
    caught: number[];
}

let panel: vscode.WebviewPanel | undefined;
let currentPokemon: Pokemon | undefined;

type Screen =
    | "home"
    | "encounter"
    | "pokedex"
    | "box"
    | "settings";

let currentScreen: Screen = "home";

export function activate(
    context: vscode.ExtensionContext
) {

    const openCommand =
        vscode.commands.registerCommand(
            "poke-code.open",
            () => {
                openPokeCode(context);
            }
        );

    context.subscriptions.push(openCommand);
}

function openPokeCode(
    context: vscode.ExtensionContext
) {

    if (panel) {

        panel.reveal(
            vscode.ViewColumn.One
        );

        updateScreen(context);

        return;
    }

    panel =
        vscode.window.createWebviewPanel(
            "pokeCode",
            "PokeCode",
            vscode.ViewColumn.One,
            {
                enableScripts: true
            }
        );

    panel.onDidDispose(
        () => {

            panel = undefined;
            currentPokemon = undefined;

        }
    );

    panel.webview.onDidReceiveMessage(
        message => {

            switch (message.command) {

                case "home":
                    currentScreen = "home";
                    currentPokemon = undefined;
                    updateScreen(context);
                    break;

                case "encounter":
                    currentScreen = "encounter";
                    currentPokemon = undefined;
                    updateScreen(context);
                    break;

                case "spawn":
                    spawnPokemon(context);
                    break;

                case "catch":
                    catchPokemon(context);
                    break;

                case "run":
                    runAway(context);
                    break;

                case "pokedex":
                    currentScreen = "pokedex";
                    currentPokemon = undefined;
                    updateScreen(context);
                    break;

                case "box":
                    currentScreen = "box";
                    currentPokemon = undefined;
                    updateScreen(context);
                    break;

                case "settings":
                    currentScreen = "settings";
                    currentPokemon = undefined;
                    updateScreen(context);
                    break;

                case "reset":
                    resetGame(context);
                    break;
            }

        }
    );

    updateScreen(context);
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

        updateScreen(context);

        return;
    }

    currentPokemon = pokemon;

    const state =
        getGameState(context);

    if (!state.seen.includes(pokemon.id)) {

        state.seen.push(
            pokemon.id
        );

        saveGameState(
            context,
            state
        );
    }

    updateScreen(context);
}

function catchPokemon(
    context: vscode.ExtensionContext
) {

    if (!currentPokemon) {
        return;
    }

    const state =
        getGameState(context);

    if (!state.caught.includes(currentPokemon.id)) {

        state.caught.push(
            currentPokemon.id
        );

        saveGameState(
            context,
            state
        );
    }

    vscode.window.showInformationMessage(
        `${currentPokemon.name} was caught!`
    );

    currentPokemon = undefined;

    updateScreen(context);
}

function runAway(
    context: vscode.ExtensionContext
) {

    if (!currentPokemon) {
        return;
    }

    vscode.window.showInformationMessage(
        `${currentPokemon.name} ran away!`
    );

    currentPokemon = undefined;

    updateScreen(context);
}

function resetGame(
    context: vscode.ExtensionContext
) {

    const state: GameState = {
        seen: [],
        caught: []
    };

    saveGameState(
        context,
        state
    );

    currentPokemon = undefined;
    currentScreen = "home";

    vscode.window.showInformationMessage(
        "PokeCode data has been reset."
    );

    updateScreen(context);
}

function getGameState(
    context: vscode.ExtensionContext
): GameState {

    const saved =
        context.globalState.get<GameState>(
            "pokeCode.gameState"
        );

    if (!saved) {

        return {
            seen: [],
            caught: []
        };
    }

    return {
        seen: Array.isArray(saved.seen)
            ? saved.seen
            : [],

        caught: Array.isArray(saved.caught)
            ? saved.caught
            : []
    };
}

function saveGameState(
    context: vscode.ExtensionContext,
    state: GameState
) {

    void context.globalState.update(
        "pokeCode.gameState",
        state
    );
}

function updateScreen(
    context: vscode.ExtensionContext
) {

    if (!panel) {
        return;
    }

    const state =
        getGameState(context);

    panel.webview.html =
        getHTML(
            context,
            state
        );
}

function spriteURL(
    id: number
): string {

    return (
        "https://raw.githubusercontent.com/" +
        "PokeAPI/sprites/master/sprites/pokemon/" +
        `${id}.png`
    );
}

function getHTML(
    context: vscode.ExtensionContext,
    state: GameState
): string {

    switch (currentScreen) {

        case "encounter":
            return getEncounterHTML(
                state
            );

        case "pokedex":
            return getPokedexHTML(
                state
            );

        case "box":
            return getBoxHTML(
                state
            );

        case "settings":
            return getSettingsHTML(
                state
            );

        case "home":
        default:
            return getHomeHTML(
                state
            );
    }
}

function getBaseHTML(
    content: string,
    state: GameState
): string {

    return `

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<style>

* {
    box-sizing: border-box;
}

body {

    background: #111;
    color: white;

    font-family:
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        Arial,
        sans-serif;

    margin: 0;
    padding: 0;

}

.app {

    max-width: 900px;
    margin: auto;

    padding: 30px;

}

.header {

    display: flex;
    align-items: center;
    justify-content: space-between;

    margin-bottom: 25px;

}

.logo {

    font-size: 24px;
    font-weight: bold;

    color: #f5d742;

}

.nav {

    display: flex;
    gap: 8px;

}

.nav button {

    padding: 7px 12px;
    font-size: 13px;

}

button {

    background: #292929;
    color: white;

    border: 1px solid #555;

    border-radius: 7px;

    padding: 11px 20px;

    cursor: pointer;

    font-size: 15px;

}

button:hover {

    background: #3b3b3b;

}

.primary {

    background: #d83b3b;
    border-color: #e35b5b;

}

.primary:hover {

    background: #ec4b4b;

}

.card {

    background: #1d1d1d;

    border: 1px solid #303030;

    border-radius: 14px;

    padding: 25px;

}

.home {

    text-align: center;

    padding: 50px 20px;

}

.homeBall {

    width: 130px;
    height: 130px;

    object-fit: contain;

    image-rendering: pixelated;

    margin-bottom: 15px;

}

.menu {

    display: grid;

    grid-template-columns:
        repeat(2, 1fr);

    gap: 15px;

    margin-top: 30px;

}

.menuButton {

    padding: 25px;

    font-size: 17px;

}

.encounter {

    text-align: center;

    padding: 35px;

}

.pokemonImage {

    width: 220px;
    height: 220px;

    object-fit: contain;

    image-rendering: pixelated;

}

.pokemonName {

    font-size: 28px;

    margin: 10px 0;

}

.type {

    color: #aaa;

}

.actions {

    margin-top: 20px;

}

.empty {

    text-align: center;

    padding: 50px;

}

.pokeball {

    width: 100px;
    height: 100px;

    object-fit: contain;

    image-rendering: pixelated;

}

.stats {

    display: flex;
    justify-content: center;

    gap: 50px;

    margin-top: 30px;

    color: #aaa;

}

.stat strong {

    color: white;

    font-size: 20px;

}

.dexGrid {

    display: grid;

    grid-template-columns:
        repeat(5, 1fr);

    gap: 12px;

}

.dexCard {

    background: #1d1d1d;

    border: 1px solid #303030;

    border-radius: 10px;

    padding: 12px;

    text-align: center;

}

.dexCard img {

    width: 90px;
    height: 90px;

    object-fit: contain;

    image-rendering: pixelated;

}

.dexNumber {

    color: #777;

    font-size: 12px;

}

.dexName {

    margin-top: 5px;

}

.unknown {

    opacity: 0.35;

}

.boxGrid {

    display: grid;

    grid-template-columns:
        repeat(5, 1fr);

    gap: 15px;

}

.boxSlot {

    min-height: 150px;

    background: #1d1d1d;

    border: 1px solid #303030;

    border-radius: 10px;

    text-align: center;

    padding: 10px;

}

.boxSlot img {

    width: 100px;
    height: 100px;

    object-fit: contain;

    image-rendering: pixelated;

}

.emptySlot {

    color: #555;

    padding-top: 55px;

}

.settings {

    max-width: 500px;

    margin: auto;

}

.danger {

    background: #6d2525;

    border-color: #963636;

}

.back {

    margin-bottom: 20px;

}

@media (max-width: 700px) {

    .dexGrid,
    .boxGrid {

        grid-template-columns:
            repeat(3, 1fr);

    }

    .menu {

        grid-template-columns:
            1fr;

    }

}

</style>

</head>

<body>

<div class="app">

<div class="header">

<div class="logo">
PokeCode
</div>

<div class="nav">

<button onclick="goHome()">
Home
</button>

<button onclick="openDex()">
Pokédex
</button>

<button onclick="openBox()">
Box
</button>

</div>

</div>

${content}

</div>

<script>

const vscode =
    acquireVsCodeApi();

function send(command) {

    vscode.postMessage({
        command: command
    });

}

function goHome() {
    send("home");
}

function openEncounter() {
    send("encounter");
}

function openDex() {
    send("pokedex");
}

function openBox() {
    send("box");
}

function openSettings() {
    send("settings");
}

function spawnPokemon() {
    send("spawn");
}

function catchPokemon() {
    send("catch");
}

function runAway() {
    send("run");
}

function resetGame() {
    send("reset");
}

</script>

</body>

</html>

`;
}

function getHomeHTML(
    state: GameState
): string {

    const content = `

<div class="card home">

<img
    class="homeBall"
    src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
>

<h1>
Welcome to PokeCode
</h1>

<p>
Your tiny Pokémon companion inside VS Code.
</p>

<div class="stats">

<div class="stat">

<strong>
${state.seen.length}
</strong>

<br>

Seen

</div>

<div class="stat">

<strong>
${state.caught.length}
</strong>

<br>

Caught

</div>

</div>

<div class="menu">

<button
    class="menuButton primary"
    onclick="openEncounter()"
>
Open Poké Ball
</button>

<button
    class="menuButton"
    onclick="openDex()"
>
📖 Pokédex
</button>

<button
    class="menuButton"
    onclick="openBox()"
>
📦 Pokémon Box
</button>

<button
    class="menuButton"
    onclick="openSettings()"
>
⚙ Settings
</button>

</div>

</div>

`;

    return getBaseHTML(
        content,
        state
    );
}

function getEncounterHTML(
    state: GameState
): string {

    let content = "";

    if (currentPokemon) {

        content = `

<div class="back">

<button onclick="goHome()">
← Home
</button>

</div>

<div class="card encounter">

<img
    class="pokemonImage"
    src="${spriteURL(currentPokemon.id)}"
>

<div class="pokemonName">
${currentPokemon.name}
</div>

<div class="type">
${currentPokemon.type}
</div>

<div class="actions">

<button
    class="primary"
    onclick="catchPokemon()"
>
Catch
</button>

<button onclick="runAway()">
Run
</button>

</div>

</div>

`;

    } else {

        content = `

<div class="back">

<button onclick="goHome()">
← Home
</button>

</div>

<div class="card empty">

<img
    class="pokeball"
    src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
>

<h2>
Open the Poké Ball
</h2>

<p>
Something may appear...
</p>

<button
    class="primary"
    onclick="spawnPokemon()"
>
Open Poké Ball
</button>

</div>

`;

    }

    return getBaseHTML(
        content,
        state
    );
}

function getPokedexHTML(
    state: GameState
): string {

    let cards = "";

    for (
        let id = 1;
        id <= 151;
        id++
    ) {

        const pokemon =
            pokemonList.find(
                p => p.id === id
            );

        if (!pokemon) {
            continue;
        }

        const seen =
            state.seen.includes(id);

        cards += `

<div class="dexCard ${
    seen ? "" : "unknown"
}">

<img
    src="${
        seen
            ? spriteURL(id)
            : spriteURL(0)
    }"
>

<div class="dexNumber">
#${String(id).padStart(3, "0")}
</div>

<div class="dexName">

${
    seen
        ? pokemon.name
        : "???"
}

</div>

</div>

`;
    }

    const content = `

<div class="back">

<button onclick="goHome()">
← Home
</button>

</div>

<h2>
Pokédex
</h2>

<p>
${state.seen.length} / 151 Pokémon encountered
</p>

<div class="dexGrid">

${cards}

</div>

`;

    return getBaseHTML(
        content,
        state
    );
}

function getBoxHTML(
    state: GameState
): string {

    let cards = "";

    for (
        let slot = 0;
        slot < 30;
        slot++
    ) {

        const pokemonId =
            state.caught[slot];

        if (pokemonId) {

            const pokemon =
                pokemonList.find(
                    p => p.id === pokemonId
                );

            if (pokemon) {

                cards += `

<div class="boxSlot">

<img
    src="${spriteURL(pokemon.id)}"
>

<div>
${pokemon.name}
</div>

</div>

`;

                continue;
            }
        }

        cards += `

<div class="boxSlot">

<div class="emptySlot">
Empty
</div>

</div>

`;
    }

    const content = `

<div class="back">

<button onclick="goHome()">
← Home
</button>

</div>

<h2>
Pokémon Box
</h2>

<p>
${state.caught.length} Pokémon stored
</p>

<div class="boxGrid">

${cards}

</div>

`;

    return getBaseHTML(
        content,
        state
    );
}

function getSettingsHTML(
    state: GameState
): string {

    const content = `

<div class="back">

<button onclick="goHome()">
← Home
</button>

</div>

<div class="card settings">

<h2>
Settings
</h2>

<p>
PokeCode currently saves your Pokédex and caught Pokémon automatically.
</p>

<hr>

<h3>
Game Data
</h3>

<p>
Seen: ${state.seen.length} / 151
</p>

<p>
Caught: ${state.caught.length} / 151
</p>

<br>

<button
    class="danger"
    onclick="resetGame()"
>
Reset All Data
</button>

</div>

`;

    return getBaseHTML(
        content,
        state
    );
}

export function deactivate() {

    panel = undefined;

}