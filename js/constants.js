/*
 * constants.js - global namespace, board dimensions, colors, shapes, tuning.
 * Loaded first. Classic script (no ES modules) so it works from file://.
 */
(function () {
  'use strict';

  const Tetris = (window.Tetris = window.Tetris || {});

  // Board geometry
  Tetris.COLS = 10;
  Tetris.ROWS = 20;
  Tetris.CELL = 30; // main board cell size in px
  Tetris.PREVIEW_CELL = 24; // next-piece preview cell size in px

  // Piece colors
  Tetris.COLORS = {
    I: '#29d8e0',
    O: '#f2c313',
    T: '#b45de0',
    S: '#4cd964',
    Z: '#ef5350',
    J: '#4d7cf3',
    L: '#f2913d'
  };

  // Tetromino shapes (square matrices, 1 = filled cell)
  Tetris.SHAPES = {
    I: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    O: [
      [1, 1],
      [1, 1]
    ],
    T: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    S: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ],
    Z: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ],
    J: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    L: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ]
  };

  // List of all piece types
  Tetris.TYPES = Object.keys(Tetris.SHAPES);

  // Timing / progression
  Tetris.BASE_DROP_INTERVAL = 800; // ms at level 1
  Tetris.DROP_INTERVAL_STEP = 100; // ms faster per level
  Tetris.MIN_DROP_INTERVAL = 80; // floor so the game stays playable
  Tetris.LINES_PER_LEVEL = 10; // lines needed per level

  // Scoring
  Tetris.SCORE_PER_LINE = [0, 100, 300, 500, 800]; // index = lines cleared at once
  Tetris.SOFT_DROP_POINTS = 1; // per cell dropped manually
  Tetris.HARD_DROP_POINTS = 2; // per cell teleported

  // Simple wall-kick offsets (in cells) tried when rotating
  Tetris.WALL_KICKS = [0, -1, 1, -2, 2];
})();
