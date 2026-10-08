import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { getAchievementStatuses, getUnlockedBoxCount, movePokemonToPosition, resolveNickname } from '../extension';

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
});
