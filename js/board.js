/*
 * board.js - grid creation, collision checks, merging, line clearing.
 */
(function () {
  'use strict';

  const Tetris = window.Tetris;
  const Board = {};

  /** Create an empty ROWS x COLS grid (null = empty cell). */
  Board.createGrid = function () {
    const grid = [];
    for (let y = 0; y < Tetris.ROWS; y++) {
      grid.push(new Array(Tetris.COLS).fill(null));
    }
    return grid;
  };

  /**
   * Check whether `shape` fits on `grid` with its top-left at (x, y).
   * Cells above the top edge (by < 0) are allowed.
   */
  Board.isValidPosition = function (grid, shape, x, y) {
    for (let cy = 0; cy < shape.length; cy++) {
      for (let cx = 0; cx < shape[cy].length; cx++) {
        if (!shape[cy][cx]) continue;
        const bx = x + cx;
        const by = y + cy;
        if (bx < 0 || bx >= Tetris.COLS) return false;
        if (by >= Tetris.ROWS) return false;
        if (by >= 0 && grid[by][bx] !== null) return false;
      }
    }
    return true;
  };

  /** Copy a piece's cells into the grid (cells above the top edge are dropped). */
  Board.mergePiece = function (grid, piece) {
    const shape = piece.shape;
    for (let cy = 0; cy < shape.length; cy++) {
      for (let cx = 0; cx < shape[cy].length; cx++) {
        if (!shape[cy][cx]) continue;
        const bx = piece.x + cx;
        const by = piece.y + cy;
        if (bx < 0 || bx >= Tetris.COLS || by < 0 || by >= Tetris.ROWS) continue;
        grid[by][bx] = piece.type;
      }
    }
  };

  /** Remove all fully filled rows. Returns the number of lines cleared. */
  Board.clearLines = function (grid) {
    let cleared = 0;
    for (let y = Tetris.ROWS - 1; y >= 0; y--) {
      let full = true;
      for (let x = 0; x < Tetris.COLS; x++) {
        if (grid[y][x] === null) {
          full = false;
          break;
        }
      }
      if (!full) continue;
      grid.splice(y, 1);
      grid.unshift(new Array(Tetris.COLS).fill(null));
      cleared++;
      y++; // a row shifted into this index; re-check it
    }
    return cleared;
  };

  Tetris.Board = Board;
})();
