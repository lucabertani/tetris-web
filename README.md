# Tetris

A classic Tetris game for the browser, built as a single static web page.
No build step, no server, no dependencies: just open `index.html` and play.

## Running

Open `index.html` directly in any modern browser (double-click it, or drag it
into a browser window). No web server, Node.js, npm, or installation of any
kind is required — the page works from the `file://` protocol.

## Controls

| Key         | Action            |
| ----------- | ----------------- |
| Arrow Left  | Move left         |
| Arrow Right | Move right        |
| Arrow Down  | Soft drop         |
| Arrow Up    | Rotate clockwise  |
| Space       | Hard drop         |
| P           | Pause / resume    |
| R           | Restart           |

## How to Play

Falling tetrominoes land on a 20×10 board. Steer and rotate them to complete
horizontal lines; completed lines are cleared and everything above shifts
down. Every 10 cleared lines you level up and the pieces fall faster.
If a newly spawned piece collides with the stack, it is game over — press
`R` to start again.

## Scoring

| Lines cleared | Base points |
| ------------- | ----------- |
| 1             | 100         |
| 2             | 300         |
| 3             | 500         |
| 4             | 800         |

Base points are multiplied by the current level. In addition:

- Soft drop: 1 point per cell moved down manually
- Hard drop: 2 points per cell teleported

## Project Structure

```text
tetris-web/
├── index.html          # single entry point
├── css/
│   └── style.css       # layout and theme
├── js/
│   ├── constants.js    # window.Tetris namespace, dimensions, colors, shapes, tuning
│   ├── board.js        # grid creation, collision checks, merging, line clearing
│   ├── piece.js        # random spawning, rotation, simple wall kicks
│   ├── game.js         # game state, rules, scoring, requestAnimationFrame loop
│   ├── renderer.js     # canvas + HUD rendering (board, ghost, preview, overlays)
│   ├── input.js        # keyboard handling
│   └── main.js         # bootstrap: wires renderer, game, input, and loop together
└── plan.md             # original implementation plan
```

All JavaScript files are classic (non-module) scripts loaded in the order
above, sharing a single `window.Tetris` global namespace. This keeps the
page fully compatible with `file://`, where ES modules are blocked by
browser CORS rules. There is no `fetch`, no `XMLHttpRequest`, and no CDN
dependency anywhere.

## Technical Notes

- The board is rendered on a 300×600 px `<canvas>` (10 columns × 20 rows,
  30 px cells); a second 120×120 px `<canvas>` previews the next piece.
- The game loop runs on `requestAnimationFrame` with delta-time
  accumulation; a 200 ms clamp prevents huge drops after tab switching.
- A translucent "ghost" piece shows where the active piece will land.
- Rotation uses simple wall-kick offsets (`0, -1, +1, -2, +2` cells); the
  `O` piece does not rotate.
- The live game instance is exposed as `window.Tetris.game` for debugging
  in the browser console.

## Possible Extensions

- Hold piece
- Full SRS rotation system with kick tables
- High score persisted in `localStorage`
- Sound effects using local audio files
- Touch controls for mobile
- Line-clear animations
