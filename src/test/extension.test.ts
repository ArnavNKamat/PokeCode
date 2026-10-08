import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import {
	canBreedPokemon,
	generatePokemonIndividualDetails,
	getAchievementStatuses,
	getPokedexSpeciesDetails,
	getUnlockedBoxCount,
	movePokemonToPosition,
	progressEggs,
	resolveNickname,
	sortPokemonForBoxes
} from '../extension';
import { pokemonList } from '../pokemon';
import { getPokemonSpeciesData, pokemonSpeciesData } from '../pokemonSpeciesData';
import { ballMultiplier, getRandomEncounter, getSpeciesSearchChance, tryCatchGenI } from '../encounters';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});

	test('resolveNickname keeps the Pokémon name when no custom name is supplied', () => {
		const result = resolveNickname({ id: '001', name: 'Bulbasaur' } as any, '   ');
		assert.strictEqual(result, 'Bulbasaur');
	});

	test('resolveNickname trims and preserves a custom nickname', () => {
		const result = resolveNickname({ id: '004', name: 'Charmander' } as any, '  Blaze  ');
		assert.strictEqual(result, 'Blaze');
	});

	test('movePokemonToPosition swaps occupied slots and moves into empty slots', () => {
		const roster = [
			{ uid: 'one', positionId: 0 },
			{ uid: 'two', positionId: 1 }
		];

		assert.deepStrictEqual(
			movePokemonToPosition(roster, 'one', 1).map(pokemon => pokemon.positionId),
			[1, 0]
		);
		assert.deepStrictEqual(
			movePokemonToPosition(roster, 'one', 4).map(pokemon => pokemon.positionId),
			[4, 1]
		);
	});

	test('achievement status tracks catch milestones and Kanto legendaries', () => {
		const statuses = getAchievementStatuses(
			1000,
			['0001', '0144', '0145', '0146', '0150', '0151'],
			Array.from({ length: 151 }, (_, index) => String(index + 1).padStart(4, '0'))
		);
		const unlockedIds = statuses.filter(achievement => achievement.unlocked).map(achievement => achievement.id);

		assert.ok(unlockedIds.includes('catch-1'));
		assert.ok(unlockedIds.includes('catch-10'));
		assert.ok(unlockedIds.includes('catch-100'));
		assert.ok(unlockedIds.includes('catch-1000'));
		assert.ok(unlockedIds.includes('legendary-all'));
		assert.ok(unlockedIds.includes('mew'));
		assert.ok(unlockedIds.includes('seen-151'));
		assert.strictEqual(
			statuses.find(achievement => achievement.id === 'catch-10')?.reward,
			'Box reward: Unlocks Box 2'
		);
		assert.strictEqual(
			statuses.find(achievement => achievement.id === 'seen-151')?.reward,
			'Major box reward: Unlocks Boxes 6–12'
		);
	});

	test('achievement pages separate general and Kanto goals', () => {
		const statuses = getAchievementStatuses(50, ['0001', '0002'], ['0001']);

		assert.ok(statuses.filter(achievement => achievement.category === 'general').length > 0);
		assert.ok(statuses.filter(achievement => achievement.category === 'kanto').length > 0);
		assert.ok(statuses.some(achievement => achievement.id === 'catch-50' && achievement.unlocked));
		assert.ok(statuses.some(achievement => achievement.id === 'species-1' && achievement.unlocked));
	});

	test('box storage unlocks by catch and Kanto collection milestones', () => {
		assert.strictEqual(getUnlockedBoxCount(0, []), 1);
		assert.strictEqual(getUnlockedBoxCount(9, []), 1);
		assert.strictEqual(getUnlockedBoxCount(10, []), 2);
		assert.strictEqual(getUnlockedBoxCount(49, []), 2);
		assert.strictEqual(getUnlockedBoxCount(50, []), 3);
		assert.strictEqual(getUnlockedBoxCount(100, []), 4);
		assert.strictEqual(getUnlockedBoxCount(0, Array.from(
			{ length: 10 },
			(_, index) => String(index + 1).padStart(4, '0')
		)), 5);
		assert.strictEqual(getUnlockedBoxCount(0, Array.from(
			{ length: 151 },
			(_, index) => String(index + 1).padStart(4, '0')
		)), 5);
		assert.strictEqual(getUnlockedBoxCount(
			0,
			[],
			0,
			Array.from({ length: 151 }, (_, index) => String(index + 1).padStart(4, '0'))
		), 12);
		assert.strictEqual(getUnlockedBoxCount(0, [], 21), 2);
	});

	test('moving Pokémon cannot target a locked box', () => {
		const roster = [{ uid: 'one', positionId: 0 }];
		assert.strictEqual(movePokemonToPosition(roster, 'one', 20, 1), roster);
	});

	test('species metadata is bundled and generates individual details offline', () => {
		assert.strictEqual(pokemonSpeciesData.size, 151);
		assert.ok(pokemonList.every(pokemon => pokemonSpeciesData.has(pokemon.id)));
		assert.strictEqual(getPokemonSpeciesData('0129').hatchEncounters, 5);

		const malePikachu = generatePokemonIndividualDetails('0025', () => 0.99);
		assert.strictEqual(malePikachu.gender, 'Male');
		assert.ok(malePikachu.heightMeters >= 0.38 && malePikachu.heightMeters <= 0.42);
		assert.ok(malePikachu.weightKg >= 5.7 && malePikachu.weightKg <= 6.3);
		assert.strictEqual(generatePokemonIndividualDetails('0151').gender, 'Genderless');
	});

	test('Pokédex species details show canonical dimensions, gender, and actual encounter odds', () => {
		const pikachu = pokemonList.find(pokemon => pokemon.id === '0025');
		const mew = pokemonList.find(pokemon => pokemon.id === '0151');
		assert.ok(pikachu);
		assert.ok(mew);

		const pikachuDetails = getPokedexSpeciesDetails(pikachu);
		assert.ok(pikachuDetails.includes('Height: 0.4 m'));
		assert.ok(pikachuDetails.includes('Weight: 6.0 kg'));
		assert.ok(pikachuDetails.includes('50% male, 50% female'));
		assert.ok(pikachuDetails.includes('about 0.50% per search'));
		assert.ok(getPokedexSpeciesDetails(mew).includes('Gender probability: Genderless'));
	});

	test('box sorting supports dex order, catch order, and first-caught primary type groups', () => {
		const roster = [
			{ id: '0025', type: 'ELECTRIC', uid: 'first-pikachu' },
			{ id: '0001', type: 'GRASS / POISON', uid: 'bulbasaur' },
			{ id: '0026', type: 'ELECTRIC', uid: 'raichu' },
			{ id: '0004', type: 'FIRE', uid: 'charmander' }
		];

		assert.deepStrictEqual(
			sortPokemonForBoxes(roster, 'id', 'asc').map(pokemon => pokemon.uid),
			['bulbasaur', 'charmander', 'first-pikachu', 'raichu']
		);
		assert.deepStrictEqual(
			sortPokemonForBoxes(roster, 'id', 'desc').map(pokemon => pokemon.uid),
			['raichu', 'first-pikachu', 'charmander', 'bulbasaur']
		);
		assert.deepStrictEqual(
			sortPokemonForBoxes(roster, 'caught', 'desc').map(pokemon => pokemon.uid),
			['charmander', 'raichu', 'bulbasaur', 'first-pikachu']
		);
		assert.deepStrictEqual(
			sortPokemonForBoxes(roster, 'type', 'asc').map(pokemon => pokemon.uid),
			['first-pikachu', 'raichu', 'bulbasaur', 'charmander']
		);
		assert.deepStrictEqual(
			sortPokemonForBoxes(roster, 'type', 'desc').map(pokemon => pokemon.uid),
			['charmander', 'bulbasaur', 'first-pikachu', 'raichu']
		);
	});

	test('current-Box type sorting uses first-caught type order from the full collection', () => {
		const fullCollection = [
			{ id: '0007', type: 'WATER', uid: 'first-water' },
			{ id: '0004', type: 'FIRE', uid: 'first-fire' },
			{ id: '0025', type: 'ELECTRIC', uid: 'first-electric' },
			{ id: '0129', type: 'WATER', uid: 'water-in-current-box' },
			{ id: '0026', type: 'ELECTRIC', uid: 'electric-in-current-box' }
		];
		const currentBox = [fullCollection[3], fullCollection[4]];

		assert.deepStrictEqual(
			sortPokemonForBoxes(currentBox, 'type', 'asc', fullCollection).map(pokemon => pokemon.uid),
			['water-in-current-box', 'electric-in-current-box']
		);
	});

	test('encounter and catch probability helpers handle boundaries and report actual odds', () => {
		assert.strictEqual(getSpeciesSearchChance(), 0.75 / 151);
		assert.strictEqual(ballMultiplier('POKE'), 1);
		assert.strictEqual(ballMultiplier('GREAT'), 1.5);
		assert.strictEqual(ballMultiplier('ULTRA'), 2);
		assert.strictEqual(tryCatchGenI(0, 50, 100), false);
		assert.strictEqual(tryCatchGenI(1, 50, 100, 'MASTER'), true);

		const originalRandom = Math.random;
		try {
			Math.random = () => 0.99;
			assert.strictEqual(tryCatchGenI(255, 100, 100), false);
			Math.random = () => 0;
			assert.strictEqual(tryCatchGenI(255, 100, 100), true);

			Math.random = () => 29 / 256;
			assert.strictEqual(tryCatchGenI(90, 100, 100), true);
			Math.random = () => 30 / 256;
			assert.strictEqual(tryCatchGenI(90, 100, 100), false);

			const randomValues = [0.1, 0.999];
			Math.random = () => randomValues.shift() ?? 0;
			const lastSpecies = getRandomEncounter();
			assert.strictEqual(lastSpecies?.id, '0151');
			assert.notStrictEqual(lastSpecies, pokemonList[pokemonList.length - 1]);
			Math.random = () => 0.75;
			assert.strictEqual(getRandomEncounter(), undefined);
		} finally {
			Math.random = originalRandom;
		}
	});

	test('only same-species, opposite-gender Pokémon can breed', () => {
		const male = { uid: 'male', id: '0025', gender: 'Male' as const };
		const female = { uid: 'female', id: '0025', gender: 'Female' as const };

		assert.strictEqual(canBreedPokemon(male, female), true);
		assert.strictEqual(canBreedPokemon(male, { ...female, id: '0026' }), false);
		assert.strictEqual(canBreedPokemon(male, { ...female, gender: 'Male' }), false);
		assert.strictEqual(canBreedPokemon(male, { ...female, egg: { encounters: 0, requiredEncounters: 10 } }), false);
	});

	test('eggs become ready to hatch after the species-specific number of later encounters', () => {
		const egg = {
			uid: 'egg',
			id: '0129',
			name: 'Magikarp',
			type: 'WATER',
			catchRate: 255,
			positionId: 0,
			gender: 'Male' as const,
			heightMeters: 0.9,
			weightKg: 10,
			egg: { encounters: 0, requiredEncounters: 5, readyToHatch: false }
		};

		for (let encounter = 0; encounter < 4; encounter++) {
			assert.strictEqual(progressEggs([egg]).length, 0);
			assert.strictEqual(egg.egg?.encounters, encounter + 1);
		}

		assert.strictEqual(progressEggs([egg]).length, 1);
		assert.strictEqual(egg.egg?.readyToHatch, true);
		assert.strictEqual(egg.egg?.encounters, 5);
		assert.strictEqual(progressEggs([egg]).length, 0);
		assert.strictEqual(egg.egg?.encounters, 5);
	});
});
