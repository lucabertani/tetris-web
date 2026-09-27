/*
 * game.js - game state, spawning, movement, drops, locking, scoring,
 * leveling, game over, and the requestAnimationFrame update loop.
 */
(function () {
  'use strict';

  const Tetris = window.Tetris;
  const Board = Tetris.Board;
  const Piece = Tetris.Piece;

  const MAX_FRAME_DT = 200; // clamp large frame gaps (e.g. tab was backgrounded)

  const Game = {};

  /** Drop interval (ms) for a level, never below the minimum. */
  Game.dropIntervalForLevel = function (level) {
    const interval = Tetris.BASE_DROP_INTERVAL - (level - 1) * Tetris.DROP_INTERVAL_STEP;
    return Math.max(Tetris.MIN_DROP_INTERVAL, interval);
  };

  /** Create a fresh game state. */
  Game.create = function () {
    return {
      grid: Board.createGrid(),
      current: null,
      next: null,
      score: 0,
      lines: 0,
      level: 1,
      dropInterval: Game.dropIntervalForLevel(1),
      dropCounter: 0,
      lastTime: 0,
      running: true,
      gameOver: false,
      paused: false
    };
  };

  /** Reset the state and spawn the first piece. */
  Game.reset = function (state) {
    state.grid = Board.createGrid();
    state.current = null;
    state.next = Piece.create(Piece.randomType());
    state.score = 0;
    state.lines = 0;
    state.level = 1;
    state.dropInterval = Game.dropIntervalForLevel(1);
    state.dropCounter = 0;
    state.lastTime = 0;
    state.running = true;
    state.gameOver = false;
    state.paused = false;
    Game.spawn(state);
  };

  /** Promote the previewed next piece to current and draw a fresh one. */
  Game.spawn = function (state) {
    state.current = Piece.create(state.next.type);
    state.next = Piece.create(Piece.randomType());
    state.dropCounter = 0;

    if (
      !Board.isValidPosition(state.grid, state.current.shape, state.current.x, state.current.y)
    ) {
      Game.endGame(state);
    }
  };

  Game.endGame = function (state) {
    state.running = false;
    state.gameOver = true;
  };

  /** Horizontal move (dx = -1 or 1). Returns true when applied. */
  Game.move = function (state, dx) {
    if (state.gameOver || state.paused || !state.current) return false;
    const piece = state.current;
    if (Board.isValidPosition(state.grid, piece.shape, piece.x + dx, piece.y)) {
      piece.x += dx;
      return true;
    }
    return false;
  };

  /** Move one row down. Returns false when the piece is resting on something. */
  Game.moveDown = function (state) {
    if (state.gameOver || state.paused || !state.current) return false;
    const piece = state.current;
    if (Board.isValidPosition(state.grid, piece.shape, piece.x, piece.y + 1)) {
      piece.y += 1;
      state.dropCounter = 0;
      return true;
    }
    return false;
  };

  Game.softDrop = function (state) {
    if (state.gameOver || state.paused || !state.current) return;
    if (Game.moveDown(state)) {
      state.score += Tetris.SOFT_DROP_POINTS;
    } else {
      Game.lockPiece(state);
    }
  };

  Game.hardDrop = function (state) {
    if (state.gameOver || state.paused || !state.current) return;
    const piece = state.current;
    const landingY = Piece.landingY(state, piece);
    state.score += (landingY - piece.y) * Tetris.HARD_DROP_POINTS;
    piece.y = landingY;
    state.dropCounter = 0;
    Game.lockPiece(state);
  };

  /** Merge the current piece, clear lines, update score/level, spawn the next. */
  Game.lockPiece = function (state) {
    const piece = state.current;
    if (!piece) return;

    Board.mergePiece(state.grid, piece);
    state.current = null;

    const cleared = Board.clearLines(state.grid);
    if (cleared > 0) {
      state.score += Tetris.SCORE_PER_LINE[cleared] * state.level;
      state.lines += cleared;
      state.level = Math.floor(state.lines / Tetris.LINES_PER_LEVEL) + 1;
      state.dropInterval = Game.dropIntervalForLevel(state.level);
    }

    Game.spawn(state);
  };

  Game.rotate = function (state, dir) {
    if (state.gameOver || state.paused) return false;
    return Piece.rotate(state, dir);
  };

  Game.togglePause = function (state) {
    if (state.gameOver || !state.running) return;
    state.paused = !state.paused;
    state.lastTime = 0; // avoid a huge delta on resume
    state.dropCounter = 0;
  };

  Game.restart = function (state) {
    Game.reset(state);
  };

  /** Advance the simulation by the time since the last frame. */
  Game.update = function (state, time) {
    if (!state.running || state.gameOver || state.paused || !state.current) {
      state.lastTime = time; // keep the clock fresh so resume has no jump
      return;
    }

    if (!state.lastTime) state.lastTime = time;
    let dt = time - state.lastTime;
    state.lastTime = time;
    if (dt > MAX_FRAME_DT) dt = MAX_FRAME_DT;
    if (dt < 0) dt = 0;

    state.dropCounter += dt;
    while (state.dropCounter >= state.dropInterval) {
      state.dropCounter -= state.dropInterval;
      if (!Game.moveDown(state)) {
        Game.lockPiece(state);
        break; // a new piece just spawned; let it fall next frame
      }
    }
  };

  /**
   * Run the main loop with requestAnimationFrame.
   * onFrame(state) is called after every update (e.g. the renderer).
   * The loop keeps rendering after game over (for the overlay) but
   * update() stops simulating once gameOver is true.
   */
  Game.loop = function (state, onFrame) {
    function frame(time) {
      Game.update(state, time);
      if (typeof onFrame === 'function') onFrame(state);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  };

  Tetris.Game = Game;
})();
