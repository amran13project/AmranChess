'use strict';
const assert = require('node:assert/strict');
require('../chess-core.js');
const Chess = globalThis.LumaChessCore;
function test(name, fn) { fn(); process.stdout.write(`PASS ${name}\n`); }
test('opening has 20 legal moves; turn changes and undo restores position', () => {
  const game = new Chess();
  assert.equal(game.moves().length, 20);
  const openingFen = game.fen();
  assert.ok(game.move({ from: 'e2', to: 'e4' }));
  assert.equal(game.turn(), 'b');
  assert.ok(game.move({ from: 'e7', to: 'e5' }));
  assert.ok(game.move({ from: 'g1', to: 'f3' }));
  assert.equal(game.history().length, 3);
  game.undo();
  assert.equal(game.turn(), 'w');
  game.reset();
  assert.equal(game.fen(), openingFen);
  assert.equal(game.move({ from: 'e2', to: 'e5' }), null);
});
test('FEN loader accepts valid positions and rejects malformed positions', () => {
  const game = new Chess();
  assert.equal(game.load_fen('7k/8/5KQ1/8/8/8/8/8 w - - 0 1'), true);
  assert.equal(game.turn(), 'w');
  assert.equal(game.load_fen('bad fen'), false);
  assert.equal(game.load_fen('8/8/8/8/8/8/8/8 w - - 0 1'), false);
});
test('castling is generated only in a legal open position', () => {
  const game = new Chess();
  assert.equal(game.load_fen('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1'), true);
  const san = game.moves();
  assert.ok(san.includes('O-O'));
  assert.ok(san.includes('O-O-O'));
});
test('en passant is generated from the FEN target square', () => {
  const game = new Chess();
  assert.equal(game.load_fen('4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1'), true);
  assert.ok(game.moves({ verbose: true }).some(m => m.from === 'e5' && m.to === 'd6' && m.flags.includes('e')));
});
test('pawn promotion exposes all four promotion choices', () => {
  const game = new Chess();
  assert.equal(game.load_fen('7k/P7/8/8/8/8/8/7K w - - 0 1'), true);
  const promotions = game.moves({ verbose: true }).filter(m => m.from === 'a7' && m.to === 'a8');
  assert.deepEqual(promotions.map(m => m.promotion).sort(), ['b', 'n', 'q', 'r']);
});
test('all three tactical puzzles have legal, non-check positions and validated mate solutions', () => {
  const puzzles = [
    ['7k/8/5KQ1/8/8/8/8/8 w - - 0 1', ['Qg7#']],
    ['6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1', ['Rd8#']],
    ['8/8/8/8/8/8/2Q5/k1K5 w - - 0 1', ['Qb2#', 'Qa4#', 'Qb1#']]
  ];
  for (const [fen, answers] of puzzles) {
    const game = new Chess();
    assert.equal(game.load_fen(fen), true);
    assert.equal(game._inCheck('b'), false, `Invalid puzzle state: black already in check: ${fen}`);
    const candidate = game.moves({ verbose: true }).find(m => answers.includes(m.san));
    assert.ok(candidate, `No expected answer for ${fen}`);
    assert.ok(game.move({ from: candidate.from, to: candidate.to, promotion: candidate.promotion || 'q' }));
    assert.equal(game.in_checkmate(), true, `Expected mate for ${candidate.san}`);
  }
});
process.stdout.write('All LumaChess core tests passed.\n');
