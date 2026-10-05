import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { movePokemonToPosition, resolveNickname } from '../extension';

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
});
