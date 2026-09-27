# Tetris Web App Plan

## Goal

Build a simple Tetris web app as a single HTML page. The app must run locally by opening `index.html` directly in a browser, without any web server, build step, or external dependency.

## Constraints

- One HTML entry point: `index.html`.
- JavaScript may be split into external files, but it must load correctly from `file://`.
- No ES modules (`import` / `export`) because they are blocked by browser CORS rules on `file://`.
- Use classic `<script src="...">` tags loaded in the correct order.
- Organize JavaScript into separate files using a global namespace, for example `window.Tetris`.
- No `fetch`, no `XMLHttpRequest`, no CDN dependencies.
- No Node.js, npm, bundler, or local server required.

## Proposed File Structure

```text
tetris/
├── index.html
├── css/
│   └── style.css
└── js/
    ├── constants.js
    ├── board.js
    ├── piece.js
    ├── game.js
    ├── renderer.js
    ├── input.js
    └── main.js
```

## Script Load Order

The scripts must be loaded in this exact order inside `index.html`:

1. `js/constants.js`
2. `js/board.js`
3. `js/piece.js`
4. `js/game.js`
5. `js/renderer.js`
6. `js/input.js`
7. `js/main.js`

Each file should extend the shared `window.Tetris` namespace.

## Module Responsibilities

### `constants.js`

- Create the global namespace `window.Tetris`.
- Define board dimensions: columns, rows, cell size.
- Define piece colors.
- Define tetromino shapes.
- Define piece type list.

### `board.js`

- Create the board grid.
- Check whether a piece position is valid.
- Merge a locked piece into the board.
- Detect and clear completed lines.
- Return the number of cleared lines.

### `piece.js`

- Generate random tetromino types.
- Create a new piece at the top center of the board.
- Rotate a piece matrix.
- Apply simple wall-kick offsets when rotation collides.
- Keep piece logic independent from rendering.

### `game.js`

- Create and manage game state.
- Store the board, current piece, next piece, score, lines, level, and timing values.
- Spawn pieces.
- Move pieces left, right, and down.
- Handle soft drop and hard drop.
- Lock pieces when they cannot move down.
- Clear lines and update score, level, and drop speed.
- Detect game over.
- Run the main update loop using `requestAnimationFrame`.

### `renderer.js`

- Initialize canvas contexts.
- Draw the board grid.
- Draw locked cells.
- Draw the current falling piece.
- Draw the next piece preview.
- Update HUD elements: score, level, lines.
- Draw the game-over overlay.

### `input.js`

- Bind keyboard events.
- Handle left and right movement.
- Handle soft drop and hard drop.
- Handle rotation.
- Handle restart.
- Prevent default browser behavior for the spacebar.

### `main.js`

- Wait for `DOMContentLoaded`.
- Initialize the renderer.
- Create the game state.
- Bind input.
- Start the game loop.
- Optionally expose the game instance for debugging.

## Core Data Model

### Board

- A matrix with `ROWS` rows and `COLS` columns.
- Each cell is either `null` or a piece type string such as `"I"`, `"O"`, `"T"`.
- The board stores only locked pieces.

### Piece

Each active piece should have:

- `type`: tetromino identifier.
- `shape`: 2D matrix representing the piece.
- `x`: horizontal position on the board.
- `y`: vertical position on the board.

### Game State

The game state should contain:

- `grid`: board matrix.
- `current`: active piece.
- `next`: next piece preview.
- `score`: current score.
- `lines`: total cleared lines.
- `level`: current level.
- `dropInterval`: automatic fall speed in milliseconds.
- `dropCounter`: accumulated time since last automatic drop.
- `lastTime`: timestamp for delta-time calculation.
- `running`: whether the game loop is active.
- `gameOver`: whether the game has ended.

## Core Mechanics

### Spawning

- Pick a random tetromino type.
- Create the piece near the top center.
- Set the current piece to the previously previewed next piece.
- Generate a new next piece.
- If the new current piece collides immediately, set game over.

### Movement

- Left and right movement checks collision before applying.
- Soft drop moves the piece down one row.
- Hard drop moves the piece down until collision, then locks it immediately.
- If downward movement fails, lock the piece.

### Rotation

- Rotate the piece matrix clockwise.
- Try simple wall kicks with horizontal offsets: `0`, `-1`, `+1`, `-2`, `+2`.
- Accept the first rotation that does not collide.
- The `O` piece does not need to rotate.

### Locking

- Merge the current piece into the board grid.
- Clear completed lines.
- Update score, line count, level, and drop interval.
- Spawn the next piece.

### Scoring

Use classic line-clear scoring:

- 1 line: 100 points
- 2 lines: 300 points
- 3 lines: 500 points
- 4 lines: 800 points

Multiply by the current level.

### Leveling

- Increase level every 10 cleared lines.
- Reduce drop interval as level increases.
- Keep a minimum drop interval so the game remains playable.

### Game Over

- Game over occurs when a newly spawned piece cannot be placed.
- Stop the game loop.
- Render a game-over overlay.
- Allow restart with the `R` key.

## Rendering Plan

- Use one canvas for the main board.
- Use a second canvas for the next-piece preview.
- Draw a subtle grid background.
- Draw locked cells using their piece colors.
- Draw the active piece on top.
- Draw the next piece centered in its preview canvas.
- Update HUD text separately from canvas rendering.
- Draw a semi-transparent overlay for game over.

## Input Plan

Keyboard controls:

| Key         | Action     |
| ----------- | ---------- |
| Arrow Left  | Move left  |
| Arrow Right | Move right |
| Arrow Down  | Soft drop  |
| Arrow Up    | Rotate     |
| Space       | Hard drop  |
| R           | Restart    |

## Game Loop Plan

- Use `requestAnimationFrame`.
- Calculate delta time between frames.
- Accumulate elapsed time in `dropCounter`.
- When `dropCounter` exceeds `dropInterval`, move the piece down automatically.
- Reset `dropCounter` after a successful drop or lock.
- Render every frame.
- Stop updating when `gameOver` is true.

## Local File Compatibility Checklist

- Do not use `type="module"`.
- Do not use `import` or `export`.
- Do not use `fetch` or `XMLHttpRequest`.
- Do not rely on a local server.
- Load scripts in the correct order.
- Use relative paths for CSS and JavaScript files.
- Test by opening `index.html` directly with the browser.

## Testing Plan

1. Open `index.html` directly from the file system.
2. Confirm the board and HUD render.
3. Confirm pieces spawn and fall automatically.
4. Confirm left and right movement works.
5. Confirm rotation works and does not clip through walls.
6. Confirm soft drop and hard drop work.
7. Confirm completed lines disappear.
8. Confirm score, lines, and level update correctly.
9. Confirm game over appears when the board fills.
10. Confirm `R` restarts the game.

## Optional Extensions

- Hold piece.
- Ghost piece showing landing position.
- Full SRS rotation system.
- Sound effects using local audio files.
- High score saved with `localStorage`.
- Touch controls for mobile.
- Pause and resume.
- Better animations for line clears.
