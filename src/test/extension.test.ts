import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { getAchievementStatuses, movePokemonToPosition, resolveNickname } from '../extension';

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
		const statuses = getAchievementStatuses(1000, ['0001', '0144', '0145', '0146', '0150', '0151']);
		const unlockedIds = statuses.filter(achievement => achievement.unlocked).map(achievement => achievement.id);

		assert.ok(unlockedIds.includes('catch-1'));
		assert.ok(unlockedIds.includes('catch-10'));
		assert.ok(unlockedIds.includes('catch-100'));
		assert.ok(unlockedIds.includes('catch-1000'));
		assert.ok(unlockedIds.includes('legendary-all'));
		assert.ok(unlockedIds.includes('mew'));
	});
});
