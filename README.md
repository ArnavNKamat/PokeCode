# PokeCode

PokeCode is an unofficial Pokémon-catching companion that lives in the Visual Studio Code Activity Bar. Search for Pokémon, grow your Kanto collection, and manage your Boxes without leaving your editor. Version **1.0.0** was released on **October 9, 2026**.

## Getting Started

Open the **PokeCode** view from the Activity Bar, or run **PokeCode: Open** from the Command Palette. Click the Poké Ball to search. A search has a 75% chance of finding a Pokémon; when one appears, each of the 151 Kanto species is equally likely.

When a Pokémon appears, choose **Catch** or **Run**. A catch can fail, including for common Pokémon. After a successful catch, enter a nickname or leave its species name unchanged. Your progress is saved between VS Code sessions.

## How to Play

- **Pokédex:** Review Pokémon you have encountered. Click an entry to expand its default height, weight, gender probability, and estimated encounter rate.
- **Boxes:** Your collection starts with one Box of 20 slots. Click a Pokémon to open its action menu: move it, view its individual details, select it for breeding, or release it. Moving it to an occupied slot swaps their positions.
- **Sorting:** Select **Sort Boxes** to reveal sorting options for all unlocked Boxes or only the current Box. Sort by Pokédex number, catch order, or primary type. Type groups are ordered by when each type was first caught; Pokémon within a group remain in catch order.
- **Breeding and eggs:** Select two Pokémon of the same species and opposite genders, then confirm breeding. Parents stay in your collection. The resulting egg is that same species—not its lowest evolution—and occupies a Box slot. Each later search that finds a Pokémon advances the egg's hatch progress. When it is ready, click the egg and choose a nickname to hatch it.
- **Achievements:** Track general milestones and Kanto collection goals on separate pages. General achievements include hatching eggs of 1, 10, 50, and all 126 Kanto species currently eligible for breeding. Achievement cards identify Box rewards; catching 10, 50, and 100 Pokémon unlocks Boxes 2–4, catching 10 different Kanto species unlocks Box 5, and encountering all 151 Kanto species unlocks Boxes 6–12.
- **Settings:** Check the installed extension version, view credits, or reset saved game data. Reset requires confirmation.

At full capacity, the 12 Boxes hold 240 Pokémon. Eggs count as Pokémon for storage.

## Offline Play and Saved Data

Pokémon species data and sprites are bundled with the extension. Encounters, breeding, and hatching do not require fetching game data from the internet. Your Pokédex, Pokémon details, eggs, and achievements are stored in VS Code extension state on your device. Resetting the game deletes this saved progress.

## Updates

VS Code normally updates installed extensions automatically when a newer Marketplace version is available. Keep **Extensions: Auto Update** enabled, or use **Check for Updates** from the Extensions view's **More Actions (...)** menu. VS Code controls installation; PokeCode cannot pause an update for confirmation. On startup, PokeCode reports when it detects that the installed version has changed.

## Feedback and Future Plans

Suggestions and bug reports are welcome. Feel free to [open an issue](https://github.com/ArnavNKamat/PokeCode/issues) or share feedback on the [GitHub repository](https://github.com/ArnavNKamat/PokeCode).

Future plans include adding Pokémon and achievements for other regions, exploring music and sound effects, and letting Pokémon interact outside their Boxes.

## Version History

The older entries are retrospective development milestones reconstructed from Git history; they do not imply that those versions were published to the Marketplace. **1.0.0 was released on October 9, 2026; 1.0.1 was released on October 10, 2026.**

- **1.0.1 — 2026-10-10:** (Released) Added General achievements for hatching eggs from distinct breedable Kanto species, made Box sorting controls hidden until requested, and improved narrow-sidebar layout, keyboard access, focus visibility, and webview markup.
- **1.0.0 — 2026-10-09:** Added trophy achievement icons, expandable Pokédex species details, click-to-hatch eggs with naming, and sorting by Pokédex number, catch order, or primary type across all Boxes or the current Box. Improved Box navigation and keyboard operation, escaped nicknames in the Box UI, and corrected catch-rate behavior so an ordinary Poké Ball does not guarantee a catch. 
- **0.9.0 — 2026-10-08:** Added offline species gender, size, and hatch-cycle data; saved individual Pokémon details; and introduced same-species breeding, eggs, and encounter-based hatch progress.
- **0.8.0 — 2026-10-08:** Added General and Kanto achievement pages, catch and Pokédex milestones, Box unlock rewards, and expanded storage.
- **0.7.0 — 2026-10-05:** Added catch, collection, Legendary, and Mythical achievements, achievement announcements, and credits.
- **0.6.0 — 2026-10-05:** Added all 151 Kanto Pokémon, Generation I-inspired catch mechanics, nicknames, and Box improvements.
- **0.5.0 — 2026-10-01:** Added the Activity Bar experience, Pokédex, collection Boxes, and Pokémon sprites.
- **0.4.0 — 2026-10-01:** Added starter Pokémon, encounters, saved progress, and reset support.
- **0.3.0 — 2026-09-28:** Added starter selection, wild encounters, catch attempts, and persistent game state.
- **0.2.0 — 2026-09-27:** Added the initial Pokémon roster and a basic encounter-and-catch experience.
- **0.1.0 — 2026-09-27:** Set up the extension project, VS Code development launch configuration, and test tooling.

## Development

Requirements: Node.js and Visual Studio Code `1.138.0` or later.

```sh
npm install
npm test
```

To run the extension during development, open the project in VS Code and press **F5**. This starts an Extension Development Host with PokeCode loaded.

- `npm run compile` compiles the TypeScript source.
- `npm run lint` checks the source with ESLint.
- `npm test` compiles, lints, and runs the extension tests.

The Marketplace extension identifier is **`ArnavNKamat.poke-code`**.

## Credits and Notices

PokeCode is an independent fan project and is not affiliated with or endorsed by Nintendo, Game Freak, or The Pokémon Company. Pokémon names, characters, and related trademarks belong to their respective owners. Review the applicable asset terms before redistributing the extension.

Pokémon sprites are sourced from the [PokeAPI sprites repository](https://github.com/PokeAPI/sprites). Bundled species gender ratios, base dimensions, and hatch-cycle values are derived from [veekun/pokedex](https://github.com/veekun/pokedex) under the MIT License; see [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md). Navigation icons include assets from [Google Material Design Icons](https://github.com/google/material-design-icons), distributed under the Apache License 2.0. Achievement trophies use a custom transparent SVG. Generation I catch-rate values are based on Pokémon Red and Blue.

PokeCode's original source code is licensed under the [MIT License](./LICENSE). Third-party assets, Pokémon names, characters, and trademarks are not relicensed by it and remain subject to their respective owners' terms.
