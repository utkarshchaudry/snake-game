# Classic Snake

A minimal classic Snake game built with vanilla HTML, CSS, and JavaScript.

## Run locally

Because this is a static site, you can open the HTML file directly or serve it with any local web server.

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000> in your browser.

## Controls

- Arrow keys or WASD to move.
- Space to pause/resume.
- Press Enter or move to start the game.
- Use the on-screen controls on touch devices.

## Manual verification checklist

- Start the game, move in all directions, and ensure the snake continues on the grid.
- Eat food to grow the snake and confirm the score increments by 10 each time.
- Collide with the wall or snake body to trigger game over.
- Pause/resume and restart to ensure the game loop resets correctly.
