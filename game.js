const GRID_SIZE = 16;
const CELL_SIZE = 30;
const TICK_MS = 140;

const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITES = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

function createInitialState() {
  const start = { x: 7, y: 7 };
  const snake = [start, { x: 6, y: 7 }, { x: 5, y: 7 }];
  const state = {
    snake,
    direction: "right",
    pendingDirection: "right",
    food: null,
    score: 0,
    alive: true,
  };
  state.food = placeFood(state, Math.random);
  return state;
}

function placeFood(state, rng) {
  const occupied = new Set(state.snake.map((part) => `${part.x},${part.y}`));
  const openCells = [];
  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      if (!occupied.has(`${x},${y}`)) {
        openCells.push({ x, y });
      }
    }
  }
  if (openCells.length === 0) {
    return null;
  }
  const index = Math.floor(rng() * openCells.length);
  return openCells[index];
}

function stepState(state, rng) {
  if (!state.alive) {
    return state;
  }
  const direction = state.pendingDirection;
  const head = state.snake[0];
  const nextHead = {
    x: head.x + DIRECTIONS[direction].x,
    y: head.y + DIRECTIONS[direction].y,
  };

  const outOfBounds =
    nextHead.x < 0 ||
    nextHead.x >= GRID_SIZE ||
    nextHead.y < 0 ||
    nextHead.y >= GRID_SIZE;

  const hitSelf = state.snake.some(
    (segment) => segment.x === nextHead.x && segment.y === nextHead.y
  );

  if (outOfBounds || hitSelf) {
    return { ...state, alive: false };
  }

  const ateFood =
    state.food && nextHead.x === state.food.x && nextHead.y === state.food.y;

  const newSnake = [nextHead, ...state.snake];
  if (!ateFood) {
    newSnake.pop();
  }

  const nextState = {
    ...state,
    snake: newSnake,
    direction,
    pendingDirection: direction,
    score: state.score + (ateFood ? 10 : 0),
  };

  if (ateFood) {
    nextState.food = placeFood(nextState, rng);
  }

  return nextState;
}

function canChangeDirection(current, next) {
  return current !== OPPOSITES[next];
}

const canvas = document.getElementById("board");
const scoreEl = document.getElementById("score");
const statusEl = document.getElementById("status");
const startButton = document.getElementById("start");
const pauseButton = document.getElementById("pause");
const restartButton = document.getElementById("restart");
const dpad = document.querySelector(".dpad");
const ctx = canvas.getContext("2d");

let state = createInitialState();
let loopId = null;
let paused = false;

function updateScore() {
  scoreEl.textContent = state.score;
}

function setStatus(message) {
  statusEl.textContent = message;
}

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#0f1c24";
  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
    }
  }

  if (state.food) {
    ctx.fillStyle = "#ff6f59";
    ctx.fillRect(
      state.food.x * CELL_SIZE + 4,
      state.food.y * CELL_SIZE + 4,
      CELL_SIZE - 8,
      CELL_SIZE - 8
    );
  }

  state.snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? "#7fe081" : "#3fc76b";
    ctx.fillRect(
      segment.x * CELL_SIZE + 3,
      segment.y * CELL_SIZE + 3,
      CELL_SIZE - 6,
      CELL_SIZE - 6
    );
  });
}

function tick() {
  if (paused) {
    return;
  }
  state = stepState(state, Math.random);
  updateScore();
  drawBoard();

  if (!state.alive) {
    clearInterval(loopId);
    loopId = null;
    pauseButton.disabled = true;
    restartButton.disabled = false;
    setStatus("Game over! Press Restart to try again.");
  }
}

function startGame() {
  if (loopId) {
    return;
  }
  paused = false;
  startButton.disabled = true;
  pauseButton.disabled = false;
  restartButton.disabled = false;
  setStatus("Good luck!");
  loopId = setInterval(tick, TICK_MS);
}

function pauseGame() {
  if (!loopId) {
    return;
  }
  paused = !paused;
  pauseButton.textContent = paused ? "Resume" : "Pause";
  setStatus(paused ? "Paused." : "Back in action.");
}

function restartGame() {
  state = createInitialState();
  updateScore();
  drawBoard();
  paused = false;
  pauseButton.textContent = "Pause";
  if (loopId) {
    clearInterval(loopId);
  }
  loopId = setInterval(tick, TICK_MS);
  startButton.disabled = true;
  pauseButton.disabled = false;
  restartButton.disabled = false;
  setStatus("Fresh start! Use arrows or WASD.");
}

function handleDirectionChange(next) {
  if (!canChangeDirection(state.direction, next)) {
    return;
  }
  if (!loopId) {
    startGame();
  }
  state.pendingDirection = next;
}

function handleKeydown(event) {
  const key = event.key.toLowerCase();
  const mapping = {
    arrowup: "up",
    arrowdown: "down",
    arrowleft: "left",
    arrowright: "right",
    w: "up",
    a: "left",
    s: "down",
    d: "right",
  };
  const next = mapping[key];
  if (next) {
    event.preventDefault();
    handleDirectionChange(next);
  }
  if (key === " ") {
    pauseGame();
  }
  if (key === "enter" && !loopId) {
    startGame();
  }
}

startButton.addEventListener("click", startGame);
pauseButton.addEventListener("click", pauseGame);
restartButton.addEventListener("click", restartGame);

dpad.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) {
    return;
  }
  const { dir } = button.dataset;
  if (dir) {
    handleDirectionChange(dir);
  }
});

document.addEventListener("keydown", handleKeydown);

updateScore();
drawBoard();
