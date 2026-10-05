# PokeCode

PokeCode is an unofficial Pokemon-catching companion that lives in the Visual Studio Code Activity Bar. Find Pokemon, build your collection, and organize them without leaving your editor.

## Features

- Encounter all 151 original Kanto Pokemon.
- Catch attempts use a Generation I-inspired catch calculation.
- Give newly caught Pokemon a nickname, or keep their species name.
- Track discoveries in the Pokedex and view caught Pokemon in five boxes of 32 slots each.
- Move Pokemon between positions and boxes. Moving onto an occupied position swaps the two Pokemon.
- Earn and view achievements for catch milestones, collecting different species, and catching Kanto's Legendary and Mythical Pokemon. Unlocks are announced when earned.
- Keep progress between VS Code sessions.

## Get Started

Open the **PokeCode** view from the Activity Bar. Select the Pokeball to search for a Pokemon. When one appears, choose **Catch** or **Run**. After a successful catch, enter a nickname or leave the species name unchanged.

Use **Boxes** to browse and organize your collection, **Pokedex** to review discoveries, **Achievements** to track goals, and **Settings** to reset progress. Reset requires two confirmations.

You can also run **PokeCode: Open** or **PokeCode: Reset Data** from the Command Palette.

## Development

Requirements: Node.js and a compatible version of Visual Studio Code (`1.138.0` or later).

```sh
npm install
npm test
```

To launch the extension during development, open this project in VS Code and press **F5**. This starts an Extension Development Host with PokeCode loaded.

Available scripts:

- `npm run compile` compiles the TypeScript source.
- `npm run lint` checks the source with ESLint.
- `npm test` compiles, lints, and runs the extension tests.

## Data and Assets

Game progress and achievement unlocks are stored using the VS Code extension's global state and persist across sessions. Resetting progress removes the saved Pokedex, box collection, and achievements.

Pokemon sprites are bundled in the extension's `media` directory. The project is an independent fan project and is not affiliated with or endorsed by Nintendo, Game Freak, or The Pokemon Company. Pokemon names and imagery are the property of their respective owners. Review the applicable asset terms before redistributing the extension.

Navigation icons are from [Google Material Design Icons](https://github.com/google/material-design-icons), distributed under the Apache License 2.0.

Project developer: [ArnavNkamat](https://github.com/ArnavNkamat). Pokémon sprite assets are sourced from the [PokeAPI sprites repository](https://github.com/PokeAPI/sprites). Generation I catch-rate values are based on Pokémon Red and Blue. Pokémon names, characters, and related trademarks belong to their respective owners.

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
