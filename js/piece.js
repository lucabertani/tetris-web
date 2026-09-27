/*
 * piece.js - random types, spawning, rotation with simple wall kicks.
 * Rendering-independent: works on plain data only.
 */
(function () {
  'use strict';

  const Tetris = window.Tetris;
  const Board = Tetris.Board;

  const Piece = {};

  /** Pick a random tetromino type. */
  Piece.randomType = function () {
    const types = Tetris.TYPES;
    return types[Math.floor(Math.random() * types.length)];
  };

  /** Create a piece of `type` at the top center of the board. */
  Piece.create = function (type) {
    const template = Tetris.SHAPES[type];
    const shape = template.map((row) => row.slice());
    return {
      type: type,
      shape: shape,
      x: Math.floor((Tetris.COLS - shape[0].length) / 2),
      y: type === 'I' ? -1 : 0 // keeps the I bar visually level with the 3x3 pieces
    };
  };

  /**
   * Rotate a square matrix. Returns a new matrix.
   * dir = 1 for clockwise, -1 for counter-clockwise.
   */
  Piece.rotateShape = function (shape, dir) {
    const size = shape.length;
    const rotated = [];
    for (let y = 0; y < size; y++) {
      const row = new Array(size);
      for (let x = 0; x < size; x++) {
        row[x] = dir > 0 ? shape[size - 1 - x][y] : shape[x][size - 1 - y];
      }
      rotated.push(row);
    }
    return rotated;
  };

  /**
   * Try to rotate state.current in place (dir = 1 CW, -1 CCW).
   * Tries each simple wall-kick offset and applies the first one that fits.
   * Returns true when the rotation was applied.
   */
  Piece.rotate = function (state, dir) {
    const piece = state.current;
    if (!piece || piece.type === 'O') return false; // the O piece is symmetric

    const rotated = Piece.rotateShape(piece.shape, dir);
    const kicks = Tetris.WALL_KICKS;
    for (let i = 0; i < kicks.length; i++) {
      const kx = piece.x + kicks[i];
      if (Board.isValidPosition(state.grid, rotated, kx, piece.y)) {
        piece.shape = rotated;
        piece.x = kx;
        return true;
      }
    }
    return false;
  };

  /** Farthest valid downward position of `piece` (used for the ghost preview). */
  Piece.landingY = function (state, piece) {
    let y = piece.y;
    while (Board.isValidPosition(state.grid, piece.shape, piece.x, y + 1)) {
      y++;
    }
    return y;
  };

  Tetris.Piece = Piece;
})();
