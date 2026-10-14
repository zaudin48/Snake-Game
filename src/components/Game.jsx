import React, { useCallback, useEffect, useRef, useState } from "react";
import Display from "./Display";

const INITIAL_SNAKE = [
  { x: 3, y: 1 },
  { x: 2, y: 1 },
  { x: 1, y: 1 },
];

const DIRS = {
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
};
const OPPOSITE = { left: "right", right: "left", up: "down", down: "up" };

const TICK_MS = 150;
const SWIPE_MIN = 24; // px a finger must travel before it counts as a swipe

const KEY_TO_DIR = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
  a: "left",
  d: "right",
  w: "up",
  s: "down",
};

const pickFood = (snake, cols, rows) => {
  const taken = new Set(snake.map((s) => s.y * cols + s.x));
  const free = [];
  for (let i = 0; i < cols * rows; i++) {
    if (!taken.has(i)) free.push(i);
  }
  if (!free.length) return null;
  const i = free[Math.floor(Math.random() * free.length)];
  return { x: i % cols, y: Math.floor(i / cols) };
};

const loadHighScore = () => {
  try {
    return Number(localStorage.getItem("snake-high-score")) || 0;
  } catch {
    return 0;
  }
};

const Game = () => {
  const boardRef = useRef(null);

  const [grid, setGrid] = useState({ cols: 0, rows: 0 });
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(loadHighScore);
  const [time, setTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // Refs hold the "live" game state so the loop never reads stale values
  const snakeRef = useRef(INITIAL_SNAKE);
  const foodRef = useRef(null);
  const scoreRef = useRef(0);
  const lastDir = useRef("right"); // direction the snake last moved in
  const dirQueue = useRef([]); // buffered turns (max 2) so fast inputs aren't lost
  const touchStart = useRef(null);

  // ---------- Direction input (shared by keyboard, swipe, D-pad) ----------
  const queueDirection = useCallback((next) => {
    const q = dirQueue.current;
    const last = q.length ? q[q.length - 1] : lastDir.current;
    if (next === last || next === OPPOSITE[last]) return;
    if (q.length < 2) q.push(next);
  }, []);

  // ---------- Measure board ----------
  useEffect(() => {
    if (!gameStarted) return;

    const measure = () => {
      if (!boardRef.current) return;
      const cell = window.innerWidth < 640 ? 22 : 30; // smaller cells on phones
      const cols = Math.floor(boardRef.current.clientWidth / cell);
      const rows = Math.floor(boardRef.current.clientHeight / cell);
      setGrid((g) => (g.cols === cols && g.rows === rows ? g : { cols, rows }));
    };

    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, [gameStarted]);

  // ---------- Reset ----------
  const resetGame = useCallback((cols, rows) => {
    const fresh = INITIAL_SNAKE.map((s) => ({ ...s }));
    snakeRef.current = fresh;
    scoreRef.current = 0;
    lastDir.current = "right";
    dirQueue.current = [];
    foodRef.current = pickFood(fresh, cols, rows);

    setSnake(fresh);
    setFood(foodRef.current);
    setScore(0);
    setTime(0);
    setGameOver(false);
  }, []);

  // New board size -> fresh game
  useEffect(() => {
    if (grid.cols > 0 && grid.rows > 0) resetGame(grid.cols, grid.rows);
  }, [grid.cols, grid.rows, resetGame]);

  // ---------- Keyboard ----------
  useEffect(() => {
    const onKey = (e) => {
      const dir = KEY_TO_DIR[e.key];
      if (!dir) return;
      e.preventDefault();
      queueDirection(dir);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [queueDirection]);

  // ---------- Swipe ----------
  const onTouchStart = (e) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchMove = (e) => {
    if (!touchStart.current) return;
    const t = e.touches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;

    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_MIN) return;

    if (Math.abs(dx) > Math.abs(dy)) {
      queueDirection(dx > 0 ? "right" : "left");
    } else {
      queueDirection(dy > 0 ? "down" : "up");
    }
    // Re-anchor so one long swipe can chain turns without lifting the finger
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchEnd = () => {
    touchStart.current = null;
  };

  // ---------- Timer (only while playing) ----------
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const timer = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, [gameStarted, gameOver]);

  // ---------- Game loop ----------
  useEffect(() => {
    const { cols, rows } = grid;
    if (!gameStarted || gameOver || !cols || !rows) return;

    const tick = () => {
      if (dirQueue.current.length) lastDir.current = dirQueue.current.shift();

      const prev = snakeRef.current;
      const head = prev[0];
      const d = DIRS[lastDir.current];
      const newHead = { x: head.x + d.x, y: head.y + d.y };

      // Wall
      if (
        newHead.x < 0 ||
        newHead.x >= cols ||
        newHead.y < 0 ||
        newHead.y >= rows
      ) {
        setGameOver(true);
        return;
      }

      const f = foodRef.current;
      const ate = f && newHead.x === f.x && newHead.y === f.y;

      // Self (tail will move away unless we're eating)
      const body = ate ? prev : prev.slice(0, -1);
      if (body.some((s) => s.x === newHead.x && s.y === newHead.y)) {
        setGameOver(true);
        return;
      }

      const next = ate ? [newHead, ...prev] : [newHead, ...prev.slice(0, -1)];
      snakeRef.current = next;
      setSnake(next);

      if (ate) {
        scoreRef.current += 1;
        setScore(scoreRef.current);
        foodRef.current = pickFood(next, cols, rows);
        setFood(foodRef.current);
      }
    };

    const interval = setInterval(tick, TICK_MS);
    return () => clearInterval(interval);
  }, [grid, gameStarted, gameOver]);

  // ---------- High score ----------
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      try {
        localStorage.setItem("snake-high-score", String(score));
      } catch {
        /* storage unavailable, ignore */
      }
    }
  }, [score, highScore]);

  // ---------- Render helpers ----------
  const { cols, rows } = grid;
  const snakeCells = new Set(snake.map((s) => s.y * cols + s.x));
  const headCell = snake[0] ? snake[0].y * cols + snake[0].x : -1;
  const foodCell = food ? food.y * cols + food.x : -1;

  if (!gameStarted) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/60 p-4">
        <div className="w-full max-w-xs rounded-lg border border-gray-600 bg-gray-900 p-8 text-center text-white">
          <h2 className="mb-3 text-3xl font-bold">Snake Game</h2>
          <p className="mb-1">High score: {highScore}</p>
          <p className="mb-5 text-sm text-gray-400">
            Swipe anywhere or use the arrow buttons to play.
          </p>
          <button
            onClick={() => setGameStarted(true)}
            className="w-full rounded-md bg-red-700 px-5 py-3 hover:bg-red-600 active:bg-red-600"
          >
            Start
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden overscroll-none touch-none select-none"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    >
      <Display score={score} highScore={highScore} time={time} />

      {/* Board */}
      <div
        ref={boardRef}
        className="box-border min-h-0 flex-1 border border-[#4B5563] mx-3 mb-3 sm:mx-auto sm:w-[90%]"
      >
        <div
          className="grid h-full w-full"
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
          }}
        >
          {Array.from({ length: cols * rows }, (_, index) => {
            let color = "";
            if (index === headCell) color = "bg-red-500";
            else if (snakeCells.has(index)) color = "bg-red-700";
            else if (index === foodCell) color = "bg-green-500 rounded-full";

            return (
              <div
                key={index}
                className={`box-border border-l border-t border-gray-500/60 ${color}`}
              />
            );
          })}
        </div>
      </div>

      {/* On-screen D-pad: only shows on touch devices */}
      <DPad onPress={queueDirection} />

      {/* Game Over */}
      {gameOver && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-xs rounded-lg border border-gray-600 bg-gray-900 p-8 text-center text-white">
            <h2 className="mb-3 text-3xl font-bold">Game Over</h2>
            <p className="mb-5">Score: {score}</p>
            <button
              onClick={() => resetGame(cols, rows)}
              className="w-full rounded-md bg-red-700 px-5 py-3 hover:bg-red-600 active:bg-red-600"
            >
              Restart
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Arrow = ({ rotate }) => (
  <svg
    viewBox="0 0 24 24"
    className="h-7 w-7"
    style={{ transform: `rotate(${rotate}deg)` }}
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M6 15l6-6 6 6" />
  </svg>
);

const DPad = ({ onPress }) => {
  // onPointerDown fires instantly; onClick waits for finger-lift and feels laggy
  const btn = (dir, rotate, label, pos) => (
    <button
      type="button"
      aria-label={label}
      onPointerDown={(e) => {
        e.preventDefault();
        onPress(dir);
      }}
      className={`${pos} flex h-16 w-16 items-center justify-center rounded-xl border border-[#4B5563] bg-gray-900 text-gray-300 transition-transform active:scale-95 active:bg-gray-700`}
    >
      <Arrow rotate={rotate} />
    </button>
  );

  return (
    <div className="hidden justify-center pb-6 [@media(pointer:coarse)]:flex">
      <div className="grid grid-cols-3 grid-rows-2 gap-2">
        {btn("up", 0, "Up", "col-start-2 row-start-1")}
        {btn("left", -90, "Left", "col-start-1 row-start-2")}
        {btn("down", 180, "Down", "col-start-2 row-start-2")}
        {btn("right", 90, "Right", "col-start-3 row-start-2")}
      </div>
    </div>
  );
};

export default Game;