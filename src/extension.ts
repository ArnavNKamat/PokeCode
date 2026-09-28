import * as vscode from "vscode";

/* =========================================================
   TYPES
   ========================================================= */

interface PokemonData {
    id: number;
    name: string;
    catchRate: number;
    minLevel: number;
    maxLevel: number;
    image: string;
}

interface PokemonInstance {
    id: number;
    name: string;
    nickname: string;
    level: number;
    experience: number;
}

interface GameState {
    starterCaught: boolean;
    party: PokemonInstance[];
    box: PokemonInstance[];
    seenPokemon: number[];
    caughtPokemon: number[];
}

interface Encounter {
    pokemon: PokemonData;
    level: number;
}


/* =========================================================
   POKEMON DATA
   ========================================================= */

const POKEMON: PokemonData[] = [

    {
        id: 1,
        name: "Bulbasaur",
        catchRate: 45,
        minLevel: 5,
        maxLevel: 5,
        image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-i/red-blue/1.png"
    },

    {
        id: 4,
        name: "Charmander",
        catchRate: 45,
        minLevel: 5,
        maxLevel: 5,
        image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-i/red-blue/4.png"
    },

    {
        id: 7,
        name: "Squirtle",
        catchRate: 45,
        minLevel: 5,
        maxLevel: 5,
        image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-i/red-blue/7.png"
    },

    {
        id: 16,
        name: "Pidgey",
        catchRate: 255,
        minLevel: 2,
        maxLevel: 5,
        image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-i/red-blue/16.png"
    },

    {
        id: 19,
        name: "Rattata",
        catchRate: 255,
        minLevel: 2,
        maxLevel: 4,
        image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-i/red-blue/19.png"
    }
];


/* =========================================================
   EXTENSION STATE
   ========================================================= */

let gamePanel: vscode.WebviewPanel | undefined;

let currentEncounter: Encounter | undefined;


/* =========================================================
   DEFAULT GAME STATE
   ========================================================= */

function createNewGame(): GameState {

    return {
        starterCaught: false,
        party: [],
        box: [],
        seenPokemon: [],
        caughtPokemon: []
    };
}


/* =========================================================
   LOAD GAME
   ========================================================= */

function getGameState(
    context: vscode.ExtensionContext
): GameState {

    return context.globalState.get<GameState>(
        "pokeCode.gameState",
        createNewGame()
    );
}


/* =========================================================
   SAVE GAME
   ========================================================= */

async function saveGameState(
    context: vscode.ExtensionContext,
    state: GameState
): Promise<void> {

    await context.globalState.update(
        "pokeCode.gameState",
        state
    );
}


/* =========================================================
   ACTIVATE
   ========================================================= */

export function activate(
    context: vscode.ExtensionContext
) {

    console.log(
        'PokeCode extension activated.'
    );


    /* -----------------------------------------------------
       MAIN COMMAND
       ----------------------------------------------------- */

    const startCommand =
        vscode.commands.registerCommand(
            "poke-code.helloWorld",
            () => {

                openGame(context);

            }
        );

    context.subscriptions.push(startCommand);


    /* -----------------------------------------------------
       RESET GAME
       ----------------------------------------------------- */

    const resetCommand =
        vscode.commands.registerCommand(
            "poke-code.resetGame",
            async () => {

                await context.globalState.update(
                    "pokeCode.gameState",
                    undefined
                );

                vscode.window.showInformationMessage(
                    "PokeCode save has been reset."
                );

                if (gamePanel) {

                    openGame(context);

                }

            }
        );

    context.subscriptions.push(resetCommand);
}


/* =========================================================
   OPEN GAME
   ========================================================= */

function openGame(
    context: vscode.ExtensionContext
) {

    if (gamePanel) {

        gamePanel.reveal(
            vscode.ViewColumn.One
        );

        updateGameScreen(context);

        return;
    }


    gamePanel =
        vscode.window.createWebviewPanel(
            "pokeCodeGame",
            "PokeCode",
            vscode.ViewColumn.One,
            {
                enableScripts: true
            }
        );


    gamePanel.onDidDispose(
        () => {

            gamePanel = undefined;

        },
        null,
        context.subscriptions
    );


    gamePanel.webview.onDidReceiveMessage(
        async message => {

            await handleMessage(
                context,
                message
            );

        },
        undefined,
        context.subscriptions
    );


    updateGameScreen(context);
}


/* =========================================================
   MESSAGE HANDLER
   ========================================================= */

async function handleMessage(
    context: vscode.ExtensionContext,
    message: any
) {

    const state =
        getGameState(context);


    /* -----------------------------------------------------
       STARTER
       ----------------------------------------------------- */

    if (message.command === "chooseStarter") {

        const starter =
            POKEMON.find(
                pokemon =>
                    pokemon.id === message.id
            );

        if (!starter) {
            return;
        }


        const starterInstance: PokemonInstance = {

            id: starter.id,

            name: starter.name,

            nickname: starter.name,

            level: 5,

            experience: 0

        };


        state.starterCaught = true;

        state.party.push(
            starterInstance
        );


        if (!state.seenPokemon.includes(starter.id)) {

            state.seenPokemon.push(
                starter.id
            );

        }


        if (!state.caughtPokemon.includes(starter.id)) {

            state.caughtPokemon.push(
                starter.id
            );

        }


        await saveGameState(
            context,
            state
        );


        currentEncounter = undefined;

        updateGameScreen(context);

        return;
    }


    /* -----------------------------------------------------
       FIND WILD POKEMON
       ----------------------------------------------------- */

    if (message.command === "encounter") {

        currentEncounter =
            generateEncounter(
                state
            );


        updateGameScreen(context);

        return;
    }


    /* -----------------------------------------------------
       CATCH
       ----------------------------------------------------- */

    if (message.command === "catch") {

        if (!currentEncounter) {
            return;
        }


        const pokemon =
            currentEncounter.pokemon;


        /*
         * Catch chance is calculated HERE.
         * It is NOT calculated when the Pokémon
         * first appears.
         */

        const success =
            calculateCatch(
                pokemon.catchRate
            );


        if (!success) {

            updateGameScreen(
                context,
                "catchFailed"
            );

            return;
        }


        const caught: PokemonInstance = {

            id: pokemon.id,

            name: pokemon.name,

            nickname: pokemon.name,

            level: currentEncounter.level,

            experience: 0

        };


        if (!state.caughtPokemon.includes(pokemon.id)) {

            state.caughtPokemon.push(
                pokemon.id
            );

        }


        if (state.party.length < 6) {

            state.party.push(
                caught
            );

        } else {

            state.box.push(
                caught
            );

        }


        await saveGameState(
            context,
            state
        );


        currentEncounter = undefined;


        /*
         * Ask for nickname after successful catch.
         */

        const nickname =
            await vscode.window.showInputBox({

                title: `You caught ${pokemon.name}!`,

                prompt:
                    "Give your Pokémon a nickname? Leave empty to keep its name.",

                placeHolder:
                    pokemon.name

            });


        if (
            nickname !== undefined &&
            nickname.trim() !== ""
        ) {

            const caughtPokemon =
                state.party.find(
                    p =>
                        p.id === pokemon.id &&
                        p.nickname === pokemon.name
                );


            if (caughtPokemon) {

                caughtPokemon.nickname =
                    nickname.trim();

            } else {

                const boxPokemon =
                    state.box.find(
                        p =>
                            p.id === pokemon.id &&
                            p.nickname === pokemon.name
                    );


                if (boxPokemon) {

                    boxPokemon.nickname =
                        nickname.trim();

                }

            }


            await saveGameState(
                context,
                state
            );

        }


        updateGameScreen(
            context,
            "caught"
        );

        return;
    }


    /* -----------------------------------------------------
       RUN
       ----------------------------------------------------- */

    if (message.command === "run") {

        if (!currentEncounter) {
            return;
        }


        currentEncounter = undefined;


        updateGameScreen(
            context,
            "ran"
        );

        return;
    }


    /* -----------------------------------------------------
       SAVE
       ----------------------------------------------------- */

    if (message.command === "save") {

        await saveGameState(
            context,
            state
        );


        vscode.window.showInformationMessage(
            "Game saved."
        );

        return;
    }


    /* -----------------------------------------------------
       LOAD
       ----------------------------------------------------- */

    if (message.command === "load") {

        updateGameScreen(context);

        return;
    }
}


/* =========================================================
   ENCOUNTER GENERATION
   ========================================================= */

function generateEncounter(
    state: GameState
): Encounter | undefined {

    /*
     * Sometimes there is no Pokémon.
     */

    const encounterRoll =
        Math.random();


    if (encounterRoll < 0.30) {

        return undefined;

    }


    /*
     * For now Route 1 has:
     *
     * Rattata
     * Pidgey
     *
     * Later we can add all routes.
     */

    const routePokemon =
        POKEMON.filter(
            pokemon =>
                pokemon.id === 16 ||
                pokemon.id === 19
        );


    const pokemon =
        routePokemon[
            Math.floor(
                Math.random() *
                routePokemon.length
            )
        ];


    const level =
        randomInteger(
            pokemon.minLevel,
            pokemon.maxLevel
        );


    return {

        pokemon,

        level

    };
}


/* =========================================================
   CATCH CALCULATION
   ========================================================= */

function calculateCatch(
    catchRate: number
): boolean {

    /*
     * Gen I catch rates range from
     * 3 to 255.
     *
     * This is a simplified catch calculation
     * for our mini-game.
     *
     * The important part is that the roll
     * happens ONLY when CATCH is pressed.
     */

    const chance =
        catchRate / 255;


    return Math.random() < chance;
}


/* =========================================================
   RANDOM INTEGER
   ========================================================= */

function randomInteger(
    min: number,
    max: number
): number {

    return Math.floor(
        Math.random() *
        (max - min + 1)
    ) + min;
}


/* =========================================================
   UPDATE GAME SCREEN
   ========================================================= */

function updateGameScreen(
    context: vscode.ExtensionContext,
    result?: string
) {

    if (!gamePanel) {
        return;
    }


    const state =
        getGameState(context);


    gamePanel.webview.html =
        getGameHTML(
            state,
            result
        );
}


/* =========================================================
   MAIN HTML
   ========================================================= */

function getGameHTML(
    state: GameState,
    result?: string
): string {


    /* -----------------------------------------------------
       STARTER SCREEN
       ----------------------------------------------------- */

    if (!state.starterCaught) {

        return getStarterHTML();

    }


    /* -----------------------------------------------------
       NO CURRENT ENCOUNTER
       ----------------------------------------------------- */

    if (!currentEncounter) {

        return getMainGameHTML(
            state,
            result
        );

    }


    /* -----------------------------------------------------
       WILD POKEMON
       ----------------------------------------------------- */

    return getWildPokemonHTML(
        state,
        currentEncounter,
        result
    );
}


/* =========================================================
   STARTER HTML
   ========================================================= */

function getStarterHTML(): string {

    return `

<!DOCTYPE html>

<html>

<head>

<meta
    charset="UTF-8"
>

<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
>

<style>

body {

    background: #111;

    color: white;

    font-family:
        Arial,
        sans-serif;

    text-align: center;

    padding: 30px;

}

h1 {

    color: #f5d742;

}

.starters {

    display: flex;

    justify-content: center;

    gap: 30px;

    margin-top: 30px;

}

.card {

    background: #222;

    border: 2px solid #555;

    border-radius: 12px;

    padding: 20px;

    width: 180px;

    cursor: pointer;

    transition: 0.2s;

}

.card:hover {

    border-color: #f5d742;

    transform:
        translateY(-5px);

}

.card img {

    width: 120px;

    height: 120px;

    image-rendering: pixelated;

}

button {

    background: #333;

    color: white;

    border: 1px solid #777;

    border-radius: 6px;

    padding: 10px 18px;

    cursor: pointer;

}

button:hover {

    background: #555;

}

</style>

</head>

<body>

<h1>Welcome to PokeCode</h1>

<h2>Choose your first Pokémon</h2>

<p>
Your adventure begins with one of these three Pokémon.
</p>

<div class="starters">

${getStarterCard(1)}

${getStarterCard(4)}

${getStarterCard(7)}

</div>

<script>

const vscode =
    acquireVsCodeApi();

function chooseStarter(id) {

    vscode.postMessage({

        command:
            "chooseStarter",

        id:
            id

    });

}

</script>

</body>

</html>

`;

}


/* =========================================================
   STARTER CARD
   ========================================================= */

function getStarterCard(
    id: number
): string {

    const pokemon =
        POKEMON.find(
            p => p.id === id
        )!;


    return `

<div
    class="card"
    onclick="chooseStarter(${pokemon.id})"
>

<img
    src="${pokemon.image}"
>

<h2>
${pokemon.name}
</h2>

<p>
Level 5
</p>

</div>

`;

}


/* =========================================================
   MAIN GAME SCREEN
   ========================================================= */

function getMainGameHTML(
    state: GameState,
    result?: string
): string {


    let message =
        "What would you like to do?";


    if (result === "ran") {

        message =
            "You ran away safely.";

    }


    if (result === "caught") {

        message =
            "Pokémon added to your team!";

    }


    if (result === "catchFailed") {

        message =
            "The Pokémon broke free!";

    }


    const partyHTML =
        state.party.map(
            pokemon => `

<div class="partyPokemon">

<img
src="${getPokemonImage(pokemon.id)}"
>

<div>

<strong>
${escapeHTML(pokemon.nickname)}
</strong>

<br>

Lv. ${pokemon.level}

</div>

</div>

`
        ).join("");


    return `

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<style>

body {

    background: #111;

    color: white;

    font-family: Arial;

    padding: 25px;

}

h1 {

    color: #f5d742;

}

.message {

    background: #222;

    padding: 15px;

    border-radius: 8px;

    margin-bottom: 20px;

}

button {

    padding: 12px 22px;

    margin: 5px;

    border-radius: 7px;

    border: 1px solid #777;

    background: #333;

    color: white;

    cursor: pointer;

}

button:hover {

    background: #555;

}

.party {

    margin-top: 30px;

}

.partyPokemon {

    display: flex;

    align-items: center;

    gap: 15px;

    background: #222;

    padding: 10px;

    margin: 8px;

    border-radius: 8px;

}

.partyPokemon img {

    width: 60px;

    height: 60px;

    image-rendering: pixelated;

}

</style>

</head>

<body>

<h1>PokeCode</h1>

<div class="message">

${message}

</div>

<button onclick="encounter()">
Search for Pokémon
</button>

<button onclick="saveGame()">
Save Game
</button>

<button onclick="loadGame()">
Load Game
</button>

<div class="party">

<h2>
Party (${state.party.length}/6)
</h2>

${partyHTML}

</div>

<p>
Box: ${state.box.length} Pokémon
</p>

<p>
Pokédex: ${state.caughtPokemon.length} caught
</p>

<script>

const vscode =
    acquireVsCodeApi();


function encounter() {

    vscode.postMessage({

        command:
            "encounter"

    });

}


function saveGame() {

    vscode.postMessage({

        command:
            "save"

    });

}


function loadGame() {

    vscode.postMessage({

        command:
            "load"

    });

}

</script>

</body>

</html>

`;

}


/* =========================================================
   WILD POKEMON HTML
   ========================================================= */

function getWildPokemonHTML(
    state: GameState,
    encounter: Encounter,
    result?: string
): string {


    const pokemon =
        encounter.pokemon;


    let message =
        `A wild ${pokemon.name} appeared!`;


    if (result === "catchFailed") {

        message =
            `The wild ${pokemon.name} broke free!`;

    }


    return `

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<style>

body {

    background: #111;

    color: white;

    font-family: Arial;

    text-align: center;

    padding: 30px;

}

h1 {

    color: #f5d742;

}

.encounter {

    background: #222;

    border-radius: 15px;

    padding: 30px;

    max-width: 500px;

    margin: auto;

}

.pokemon {

    width: 220px;

    height: 220px;

    image-rendering: pixelated;

}

.level {

    font-size: 20px;

}

.message {

    margin: 20px;

    font-size: 18px;

}

button {

    padding: 14px 30px;

    margin: 8px;

    border-radius: 7px;

    border: 1px solid #777;

    background: #333;

    color: white;

    cursor: pointer;

    font-size: 16px;

}

button:hover {

    background: #555;

}

button:disabled {

    opacity: 0.4;

    cursor: default;

}

</style>

</head>

<body>

<div class="encounter">

<h1>
Wild ${pokemon.name}!
</h1>

<img
class="pokemon"
src="${pokemon.image}"
>

<div class="level">

Level ${encounter.level}

</div>

<div class="message">

${message}

</div>

<button
id="catchButton"
onclick="catchPokemon()"
>

CATCH

</button>

<button
id="runButton"
onclick="runAway()"
>

RUN

</button>

</div>


<script>

const vscode =
    acquireVsCodeApi();


let finished = false;


function disableButtons() {

    finished = true;

    document.getElementById(
        "catchButton"
    ).disabled = true;

    document.getElementById(
        "runButton"
    ).disabled = true;

}


function catchPokemon() {

    if (finished) {

        return;

    }

    /*
     * IMPORTANT:
     *
     * The actual catch calculation
     * happens in extension.ts AFTER
     * this message is received.
     */

    disableButtons();

    vscode.postMessage({

        command:
            "catch"

    });

}


function runAway() {

    if (finished) {

        return;

    }

    disableButtons();

    vscode.postMessage({

        command:
            "run"

    });

}

</script>

</body>

</html>

`;

}


/* =========================================================
   POKEMON IMAGE
   ========================================================= */

function getPokemonImage(
    id: number
): string {

    const pokemon =
        POKEMON.find(
            p => p.id === id
        );


    if (!pokemon) {

        return "";

    }


    return pokemon.image;
}


/* =========================================================
   HTML ESCAPING
   ========================================================= */

function escapeHTML(
    text: string
): string {

    return text

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================================================
   DEACTIVATE
   ========================================================= */

export function deactivate() {

    gamePanel = undefined;

}