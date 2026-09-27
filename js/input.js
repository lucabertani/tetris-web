/*
 * input.js - keyboard bindings.
 */
(function () {
  'use strict';

  const Tetris = window.Tetris;
  const Game = Tetris.Game;

  const Input = {};

  // Keys that must never trigger their default browser action (scrolling etc.)
  const GAME_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' '];

  Input.bind = function (state) {
    document.addEventListener('keydown', function (event) {
      const key = event.key;

      if (GAME_KEYS.indexOf(key) !== -1) {
        event.preventDefault(); // e.g. stop the spacebar from scrolling the page
      }

      if (key === 'ArrowLeft') {
        Game.move(state, -1);
      } else if (key === 'ArrowRight') {
        Game.move(state, 1);
      } else if (key === 'ArrowDown') {
        Game.softDrop(state);
      } else if (key === 'ArrowUp') {
        Game.rotate(state, 1);
      } else if (key === ' ') {
        if (!event.repeat) Game.hardDrop(state); // ignore OS key-repeat
      } else if (key === 'r' || key === 'R') {
        Game.restart(state);
      } else if (key === 'p' || key === 'P') {
        Game.togglePause(state);
      }
    });
  };

  Tetris.Input = Input;
})();
