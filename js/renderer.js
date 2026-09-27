/*
 * renderer.js - canvas + HUD rendering. Pure presentation, no game logic.
 */
(function () {
  'use strict';

  const Tetris = window.Tetris;
  const Piece = Tetris.Piece;

  const Renderer = {};

  const CELL = Tetris.CELL;
  const BOARD_W = Tetris.COLS * CELL;
  const BOARD_H = Tetris.ROWS * CELL;
  const PREVIEW_SIZE = Tetris.PREVIEW_CELL * 5;

  let boardCtx = null;
  let previewCtx = null;
  let hud = null;

  /** Grab canvas contexts and size the canvases to match the constants. */
  Renderer.init = function (boardCanvas, previewCanvas, hudElements) {
    boardCanvas.width = BOARD_W;
    boardCanvas.height = BOARD_H;
    boardCtx = boardCanvas.getContext('2d');

    previewCanvas.width = PREVIEW_SIZE;
    previewCanvas.height = PREVIEW_SIZE;
    previewCtx = previewCanvas.getContext('2d');

    hud = hudElements || null;
  };

  /** Draw one filled cell with a light bevel. `alpha` is optional (ghost). */
  function drawCell(ctx, col, row, size, color, alpha) {
    const px = col * size;
    const py = row * size;
    const bevel = Math.max(1, size * 0.08);

    if (typeof alpha === 'number') ctx.globalAlpha = alpha;

    ctx.fillStyle = color;
    ctx.fillRect(px, py, size, size);

    ctx.fillStyle = 'rgba(255,255,255,0.30)';
    ctx.fillRect(px, py, size, bevel);
    ctx.fillStyle = 'rgba(0,0,0,0.30)';
    ctx.fillRect(px, py + size - bevel, size, bevel);

    ctx.strokeStyle = 'rgba(0,0,0,0.45)';
    ctx.lineWidth = 1;
    ctx.strokeRect(px + 0.5, py + 0.5, size - 1, size - 1);

    if (typeof alpha === 'number') ctx.globalAlpha = 1;
  }

  /** Dark background with a subtle grid. */
  function drawGridBackground(ctx, size, cols, rows) {
    ctx.fillStyle = '#10141f';
    ctx.fillRect(0, 0, cols * size, rows * size);

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= cols; x++) {
      ctx.moveTo(x * size + 0.5, 0);
      ctx.lineTo(x * size + 0.5, rows * size);
    }
    for (let y = 0; y <= rows; y++) {
      ctx.moveTo(0, y * size + 0.5);
      ctx.lineTo(cols * size, y * size + 0.5);
    }
    ctx.stroke();
  }

  /** Draw the occupied cells of a shape, offset in cells. `alpha` optional. */
  function drawShape(ctx, shape, type, size, offsetX, offsetY, alpha) {
    const color = Tetris.COLORS[type];
    for (let cy = 0; cy < shape.length; cy++) {
      for (let cx = 0; cx < shape[cy].length; cx++) {
        if (!shape[cy][cx]) continue;
        const row = cy + offsetY;
        if (row < 0) continue; // above the visible board
        drawCell(ctx, cx + offsetX, row, size, color, alpha);
      }
    }
  }

  /** Bounding box (in matrix cells) of a shape's occupied cells. */
  function shapeBounds(shape) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (!shape[y][x]) continue;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
    return { minX: minX, minY: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
  }

  /** Draw the next piece, centered in the preview canvas. */
  function drawPreview(ctx, piece) {
    const cell = Tetris.PREVIEW_CELL;

    ctx.fillStyle = '#10141f';
    ctx.fillRect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE);

    if (!piece) return;

    const bounds = shapeBounds(piece.shape);
    const offsetX = (PREVIEW_SIZE - bounds.w * cell) / (2 * cell) - bounds.minX;
    const offsetY = (PREVIEW_SIZE - bounds.h * cell) / (2 * cell) - bounds.minY;
    drawShape(ctx, piece.shape, piece.type, cell, offsetX, offsetY);
  }

  /** Update the DOM HUD values. */
  function drawHud(state) {
    if (!hud) return;
    if (hud.score) hud.score.textContent = String(state.score);
    if (hud.level) hud.level.textContent = String(state.level);
    if (hud.lines) hud.lines.textContent = String(state.lines);
  }

  /** Semi-transparent full-board overlay with a message. */
  function drawOverlay(message, subMessage) {
    boardCtx.fillStyle = 'rgba(8, 10, 16, 0.72)';
    boardCtx.fillRect(0, 0, BOARD_W, BOARD_H);

    boardCtx.textAlign = 'center';
    boardCtx.textBaseline = 'middle';

    boardCtx.fillStyle = '#ffffff';
    boardCtx.font = 'bold 30px "Segoe UI", Arial, sans-serif';
    boardCtx.fillText(message, BOARD_W / 2, BOARD_H / 2 - 16);

    boardCtx.font = '14px "Segoe UI", Arial, sans-serif';
    boardCtx.fillStyle = 'rgba(255,255,255,0.75)';
    boardCtx.fillText(subMessage, BOARD_W / 2, BOARD_H / 2 + 14);
  }

  /** Render one full frame: board, locked cells, ghost + current piece, preview, HUD, overlays. */
  Renderer.draw = function (state) {
    if (!boardCtx) return;

    drawGridBackground(boardCtx, CELL, Tetris.COLS, Tetris.ROWS);

    // locked cells
    for (let y = 0; y < Tetris.ROWS; y++) {
      for (let x = 0; x < Tetris.COLS; x++) {
        const type = state.grid[y][x];
        if (type) drawCell(boardCtx, x, y, CELL, Tetris.COLORS[type]);
      }
    }

    // ghost (landing position) then the active piece on top
    const piece = state.current;
    if (piece && !state.gameOver) {
      const landingY = Piece.landingY(state, piece);
      drawShape(boardCtx, piece.shape, piece.type, CELL, piece.x, landingY, 0.22);
      drawShape(boardCtx, piece.shape, piece.type, CELL, piece.x, piece.y);
    }

    // next piece preview
    if (previewCtx) drawPreview(previewCtx, state.next);

    // HUD
    drawHud(state);

    // overlays
    if (state.gameOver) {
      drawOverlay('GAME OVER', 'Score ' + state.score + '  -  press R to restart');
    } else if (state.paused) {
      drawOverlay('PAUSED', 'press P to resume');
    }
  };

  Tetris.Renderer = Renderer;
})();
