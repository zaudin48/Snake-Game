import React, { useEffect, useRef, useState } from "react";
import Display from "./Display";
const Game = () => {
    
    const boardRef = useRef(null);
    const [blocks, setBlocks] = useState([]);
    const [cols, setCols] = useState(0);
    const [rows, setRows] = useState(0);
    const [highScore, setHighScore] = useState(0)
    const [time, setTime] = useState(0)
    const [gameStarted, setGameStarted] = useState(false);
    const [snake, setSnake] = useState([
        { x: 3, y: 1 },
        { x: 2, y: 1 },
        { x: 1, y: 1 },
    ]);

    const [food, setFood] = useState(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    const direction = useRef("right");

    // Generate board
    useEffect(() => {
        if (!boardRef.current) return;

        const width = boardRef.current.clientWidth;
        const height = boardRef.current.clientHeight;

        const newCols = Math.floor(width / 30);
        const newRows = Math.floor(height / 30);

        setCols(newCols);
        setRows(newRows);

        setBlocks(Array(newCols * newRows).fill(null));
    }, [gameStarted]);
    //Display time
    useEffect(() => {
    const timer = setInterval(() => {
        setTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
}, []);
    // Generate food
    const generateFood = (currentSnake = snake) => {
        if (!cols || !rows) return;

        let newFood;

        do {
            newFood = {
                x: Math.floor(Math.random() * cols),
                y: Math.floor(Math.random() * rows),
            };
        } while (
            currentSnake.some(
                (segment) =>
                    segment.x === newFood.x &&
                    segment.y === newFood.y
            )
        );

        setFood(newFood);
    };

    // Create food when board is ready
    useEffect(() => {
        if (cols > 0 && rows > 0 && !food) {
            generateFood();
        }
    }, [cols, rows]);

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "ArrowLeft" && direction.current !== "right") {
                direction.current = "left";
            }

            if (e.key === "ArrowRight" && direction.current !== "left") {
                direction.current = "right";
            }

            if (e.key === "ArrowUp" && direction.current !== "down") {
                direction.current = "up";
            }

            if (e.key === "ArrowDown" && direction.current !== "up") {
                direction.current = "down";
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    // Game loop
    useEffect(() => {
        if (!cols || !rows || gameOver) return;

        const interval = setInterval(() => {
            setSnake((prevSnake) => {
                const head = prevSnake[0];

                let newHead;

                if (direction.current === "left") {
                    newHead = {
                        x: head.x - 1,
                        y: head.y,
                    };
                } else if (direction.current === "right") {
                    newHead = {
                        x: head.x + 1,
                        y: head.y,
                    };
                } else if (direction.current === "up") {
                    newHead = {
                        x: head.x,
                        y: head.y - 1,
                    };
                } else if (direction.current === "down") {
                    newHead = {
                        x: head.x,
                        y: head.y + 1,
                    };
                }

                // Wall collision
                if (
                    newHead.x < 0 ||
                    newHead.x >= cols ||
                    newHead.y < 0 ||
                    newHead.y >= rows
                ) {
                    setGameOver(true);
                    return prevSnake;
                }

                // Self collision
                const hitSelf = prevSnake.some(
                    (segment) =>
                        segment.x === newHead.x &&
                        segment.y === newHead.y
                );

                if (hitSelf) {
                    setGameOver(true);
                    return prevSnake;
                }

                // Check food
                const ateFood =
                    food &&
                    newHead.x === food.x &&
                    newHead.y === food.y;

                if (ateFood) {
                    setScore((prevScore) => prevScore + 1);

                    const newSnake = [newHead, ...prevSnake];

                    generateFood(newSnake);
                     if(score >= highScore){
                        setHighScore(score)
                    }
                    return newSnake;
                   
                }

                // Normal movement
                return [newHead, ...prevSnake.slice(0, -1)];
            });
        }, 150);

        return () => clearInterval(interval);
    }, [cols, rows, food, gameOver]);

    // Restart game
    const restartGame = () => {
        const initialSnake = [
            { x: 3, y: 1 },
            { x: 2, y: 1 },
            { x: 1, y: 1 },
        ];

        setSnake(initialSnake);
        setScore(0);
        setGameOver(false);
        setTime(0)

        direction.current = "right";

        generateFood(initialSnake);
    };

    return ( !gameStarted ? (<div className="fixed inset-0 flex items-center justify-center bg-black/60">
                    <div className="rounded-lg border border-gray-600 bg-gray-900 p-8 text-center text-white">
                        <h2 className="mb-3 text-3xl font-bold">
                           Snake Game
                        </h2>

                        <p className="mb-5">
                            Score: {score}
                        </p>

                        <button
                            onClick={() => setGameStarted(true)}
                            className="rounded-md bg-red-700 px-5 py-2 hover:bg-red-600"
                        >
                           start
                        </button>
                    </div>
                </div>
) : (
        <div >
            {/* Score */}
            <Display score={score} highScore={highScore} time={time}/>
          
            {/* Board */}
            <div
                ref={boardRef}
                className="border border-[#4B5563] grid box-border min-h-[calc(100vh-10rem)] w-[90%] m-auto"
                style={{
                    gridTemplateColumns: `repeat(${cols}, minmax(30px, 1fr))`,
                    gridTemplateRows: `repeat(${rows}, minmax(30px, 1fr))`,
                }}
            >
                {blocks.map((_, index) => {
                    const i = Math.floor(index / cols);
                    const j = index % cols;

                    const isSnake = snake.some(
                        (segment) =>
                            segment.x === j &&
                            segment.y === i
                    );

                    const isHead =
                        snake[0]?.x === j &&
                        snake[0]?.y === i;

                    const isFood =
                        food?.x === j &&
                        food?.y === i;

                    return (
                        <div
                            key={index}
                            className={`
                                w-7.5
                                h-7.5
                                box-border
                                border-l
                                border-t
                                border-gray-500
                                ${isSnake ? "bg-red-700" : ""}
                                ${isHead ? "bg-red-500" : ""}
                                ${isFood ? "bg-green-500" : ""}
                            `}
                        />
                    );
                })}
            </div>

            {/* Game Over */}
            {gameOver && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/60">
                    <div className="rounded-lg border border-gray-600 bg-gray-900 p-8 text-center text-white">
                        <h2 className="mb-3 text-3xl font-bold">
                            Game Over
                        </h2>

                        <p className="mb-5">
                            Score: {score}
                        </p>

                        <button
                            onClick={restartGame}
                            className="rounded-md bg-red-700 px-5 py-2 hover:bg-red-600"
                        >
                            Restart
                        </button>
                       
                    </div>
                </div>
            )}
        </div>
    )
 )
};

export default Game;