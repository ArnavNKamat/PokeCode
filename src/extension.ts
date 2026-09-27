import * as vscode from 'vscode';
import { pokemonList, Pokemon } from './pokemon';

function getRandomPokemon(): Pokemon {
    const randomIndex = Math.floor(Math.random() * pokemonList.length);
    return pokemonList[randomIndex];
}

export function activate(context: vscode.ExtensionContext) {

    const disposable = vscode.commands.registerCommand(
        'poke-code.openPokemon',
        () => {

            const pokemon = getRandomPokemon();

            const panel = vscode.window.createWebviewPanel(
                'pokeCode',
                'PokeCode',
                vscode.ViewColumn.One,
                {
                    enableScripts: true
                }
            );

            panel.webview.html = `
                <!DOCTYPE html>

                <html>
                <head>

                    <meta charset="UTF-8">

                    <style>

                        body {
                            background: #9bbc0f;
                            color: #0f380f;
                            font-family: monospace;
                            text-align: center;
                            padding: 30px;
                        }

                        .game {
                            max-width: 500px;
                            margin: auto;
                            border: 4px solid #0f380f;
                            padding: 30px;
                        }

                        .pokemon {
                            font-size: 70px;
                            margin: 30px;
                        }

                        button {
                            background: #9bbc0f;
                            color: #0f380f;
                            border: 3px solid #0f380f;
                            padding: 12px 25px;
                            margin: 10px;
                            font-family: monospace;
                            font-weight: bold;
                            cursor: pointer;
                        }

                    </style>

                </head>

                <body>

                    <div class="game">

                        <h1>POKéCODE</h1>

                        <h2>A WILD ${pokemon.name} APPEARED!</h2>

                        <div class="pokemon">
                            ?
                        </div>

                        <p>Lv. 3</p>

                        <p>TYPE: ${pokemon.type}</p>

                        <p>HP: ${pokemon.baseHp}</p>

                        <button>CATCH</button>

                        <button>RUN</button>

                    </div>

                </body>

                </html>
            `;
        }
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {}