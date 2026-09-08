import React, { useRef , useEffect , useState}  from 'react'

const Game = () => {
 const boardRef = useRef(null);
 const [block, setBlock] = useState([]);
 const [cols, setCols] = useState();
 const [rows, setRows] = useState();
 const [snake, setSnake] = useState([{x : 3 , y: 1}])

let head = null
const direction = "up"

useEffect(() => {
    const interval = setInterval(() => {
        if(direction === "left"){ 
           setSnake(prevSnake => {
                const newHead = {
                    x: prevSnake[0].x - 1,
                    y: prevSnake[0].y
                };

                return [newHead];
            });
         }
         else if (direction === "right"){
            setSnake(prevSnake => {
                const newHead = {
                    x: prevSnake[0].x + 1,
                    y: prevSnake[0].y
                };

                return [newHead];
            });
         }else if (direction === "down"){
            setSnake(prevSnake => {
                const newHead = {
                    x: prevSnake[0].x,
                    y: prevSnake[0].y + 1
                };

                return [newHead];
            });
         } else if (direction === "up"){
            setSnake(prevSnake => {
                const newHead = {
                    x: prevSnake[0].x,
                    y: prevSnake[0].y - 1
                };

                return [newHead];
            });
         }

     
    },1000);
    return () => clearInterval(interval);       
}, []);

  useEffect(()=>{
     const cols = Math.floor(boardRef.current.offsetWidth / 30);
     setCols(cols);
     const rows = Math.floor(boardRef.current.offsetHeight / 30);
     setRows(rows);
     const totalBlocks = cols * rows;
     console.log(cols, rows)
     console.log(totalBlocks);
     setBlock(Array(totalBlocks).fill(null));
  },[])
 
  
  return (
    <div ref={boardRef} className='border border-[#4B5563]  mx-10 mt-10 grid  min-h-[calc(100vh-10rem)] box-border' style={{
    gridTemplateColumns: `repeat(${cols}, minmax(30px, 1fr))` ,gridTemplateRows: `repeat(${rows}, minmax(30px, 1fr))`
}}>
        {
            block.map((block,idx)=>{
                const i = Math.floor(idx / cols);
                const j = idx % cols;
                const isSnake = snake.some(segment => segment.x === j && segment.y === i )
                return <div key={idx} className={`block w-7.5 h-7.5 border border-gray-500 box-border border-l border-t text-white text-[6px] ${isSnake ? 'bg-red-700' : ''}`} >{i},{j}</div>
            })
        }
    </div>
  )
}

export default Game