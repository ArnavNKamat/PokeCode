import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import {
	canBreedPokemon,
	generatePokemonIndividualDetails,
	getAchievementStatuses,
	getUnlockedBoxCount,
	movePokemonToPosition,
	progressEggs,
	resolveNickname
} from '../extension';
import { pokemonList } from '../pokemon';
import { getPokemonSpeciesData, pokemonSpeciesData } from '../pokemonSpeciesData';

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

	test('only same-species, opposite-gender Pokémon can breed', () => {
		const male = { uid: 'male', id: '0025', gender: 'Male' as const };
		const female = { uid: 'female', id: '0025', gender: 'Female' as const };

		assert.strictEqual(canBreedPokemon(male, female), true);
		assert.strictEqual(canBreedPokemon(male, { ...female, id: '0026' }), false);
		assert.strictEqual(canBreedPokemon(male, { ...female, gender: 'Male' }), false);
		assert.strictEqual(canBreedPokemon(male, { ...female, egg: { encounters: 0, requiredEncounters: 10 } }), false);
	});

	test('eggs hatch after the species-specific number of later encounters', () => {
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
			egg: { encounters: 0, requiredEncounters: 5 }
		};

			for (let encounter = 0; encounter < 4; encounter++) {
				assert.strictEqual(progressEggs([egg]).length, 0);
				assert.strictEqual(egg.egg?.encounters, encounter + 1);
			}

			assert.strictEqual(progressEggs([egg]).length, 1);
		assert.strictEqual(egg.egg, undefined);
	});
});
