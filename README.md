# PokeCode

PokeCode is an unofficial Pokemon-catching companion that lives in the Visual Studio Code Activity Bar. Find Pokemon, build your collection, and organize them without leaving your editor.

## Features

- Encounter all 151 original Kanto Pokemon.
- Catch attempts use a Generation I-inspired catch calculation.
- Give newly caught Pokemon a nickname, or keep their species name.
- Save each caught Pokémon's gender, height, and weight. Breed compatible same-species pairs, then hatch their eggs by encountering Pokémon; species-specific hatch data and breeding details are bundled for offline play.
- Track discoveries in the Pokédex and organize caught Pokémon in boxes of 20 slots each. Start with one box; catch 10, 50, and 100 Pokémon to unlock Boxes 2–4, and catch 10 different Kanto species to unlock Box 5. Encounter all 151 Kanto Pokémon to unlock Boxes 6–12, for 240 total storage slots.
- Box-reward achievements are highlighted and show the Box unlock reward on their achievement cards.
- Hover over or focus a Pokémon in a Box to move it, view its details, select it for breeding, or release it. Moving onto an occupied position swaps the two Pokémon.
- Browse General and Kanto achievement pages for catch milestones, Pokédex progress, and Legendary and Mythical Pokémon. Unlocks are announced when earned.
- Keep progress between VS Code sessions.

## Get Started

Open the **PokeCode** view from the Activity Bar. Select the Pokeball to search for a Pokemon. When one appears, choose **Catch** or **Run**. After a successful catch, enter a nickname or leave the species name unchanged.

Use **Boxes** to browse and organize your collection, **Pokedex** to review discoveries, **Achievements** to track goals, and **Settings** to reset progress. Reset requires two confirmations.

You can also run **PokeCode: Open** or **PokeCode: Reset Data** from the Command Palette.

## Updates

After a new version is published to the Visual Studio Marketplace, VS Code normally updates the extension automatically. Keep **Extensions: Auto Update** enabled in Settings. To look for an update manually, open the Extensions view, select its **More Actions (...)** menu, and choose **Check for Updates**. Updates are available only after the new version has been published.

When PokeCode starts after detecting a version change, it confirms that the update started successfully and that the saved game is ready. VS Code controls when extension updates are installed; PokeCode cannot pause that installation for confirmation.

## Future Plans

- Add Pokémon from other regions, with more regional achievements.
- Explore adding music and sound effects.
- Let Pokémon interact while they are out of their boxes.

Suggestions and bug reports are welcome. Feel free to [open an issue on GitHub](https://github.com/ArnavNkamat/poke-code/issues).

## Version History

The entries below are development milestones reconstructed from the project's commit history. They document how the current version was built and are not a record of published Marketplace releases.

- **0.9.0 — 2026-10-08 (current development version):** Added offline, species-specific gender, height, weight, and hatch-cycle data. Caught Pokémon retain their individual details. Compatible same-species pairs can breed to create eggs that occupy Box slots; subsequent encounters advance hatching, and offspring details are randomized with influence from their parents.
- **0.8.0 — 2026-10-08:** Split achievements into General and Kanto pages and added more catch and Pokédex milestones. Changed storage to 20 Pokémon per Box; players start with one Box, unlock Boxes 2–5 through catch and species achievements, and earn Boxes 6–12 by encountering all 151 Kanto Pokémon.
- **0.7.0 — 2026-10-05:** Added catch, collection, Legendary, and Mythical achievements; added achievement announcements and credits.
- **0.6.0 — 2026-10-05:** Added all 151 Kanto Pokémon, Generation I-inspired catch mechanics, nicknames, and improved box navigation and organization.
- **0.5.0 — 2026-10-01:** Added the Activity Bar experience, five collection boxes, Pokédex, and collection management.
- **0.4.0 — 2026-10-01:** Added starter Pokémon, weighted encounters, saved progress, and reset support.
- **0.3.0 — 2026-09-28:** Added starter selection, wild encounters, catch attempts, and persistent game state.
- **0.2.0 — 2026-09-27:** Added the initial Pokémon roster and a basic encounter-and-catch experience.
- **0.1.0 — 2026-09-27:** Set up the extension project, VS Code development launch configuration, and test tooling.

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

Game progress, individual Pokémon details, eggs, and achievement unlocks are stored using the VS Code extension's global state and persist across sessions. Species data is bundled locally, so breeding and egg hatching work offline. Resetting progress removes the saved Pokédex, box collection, eggs, and achievements.

Pokemon sprites are bundled in the extension's `media` directory. The project is an independent fan project and is not affiliated with or endorsed by Nintendo, Game Freak, or The Pokemon Company. Pokemon names and imagery are the property of their respective owners. Review the applicable asset terms before redistributing the extension.

Navigation icons are from [Google Material Design Icons](https://github.com/google/material-design-icons), distributed under the Apache License 2.0.

Bundled species gender ratios, base dimensions, and hatch-cycle values are derived from [veekun/pokedex](https://github.com/veekun/pokedex) under the MIT License. See [third-party notices](./THIRD_PARTY_NOTICES.md).

Project developer: [ArnavNkamat](https://github.com/ArnavNkamat). Pokémon sprite assets are sourced from the [PokeAPI sprites repository](https://github.com/PokeAPI/sprites). Generation I catch-rate values are based on Pokémon Red and Blue. Pokémon names, characters, and related trademarks belong to their respective owners.

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
