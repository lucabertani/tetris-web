/*
 * main.js - bootstrap: renderer, game state, input, game loop.
 */
(function () {
  'use strict';

  const Tetris = window.Tetris;

  function init() {
    const boardCanvas = document.getElementById('board');
    const previewCanvas = document.getElementById('next');
    if (!boardCanvas || !previewCanvas) return;

    Tetris.Renderer.init(
      boardCanvas,
      previewCanvas,
      {
        score: document.getElementById('score'),
        level: document.getElementById('level'),
        lines: document.getElementById('lines')
      }
    );

    const state = Tetris.Game.create();
    Tetris.Game.reset(state);

    Tetris.Input.bind(state);

    // Exposed for debugging in the browser console
    window.Tetris.game = state;

    Tetris.Game.loop(state, function (s) {
      Tetris.Renderer.draw(s);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
