import React from 'react'

const Display = ({score , highScore , time}) => {
  return (
    <div className='text-gray-300 text-md font-sm flex justify-between items-center h-10  px-10 pt-10 mb-10'>
        <div className='border border-[#4B5563] rounded-md px-2 py-1'>
         high score : {highScore}
        </div>
        <div className='border border-[#4B5563] rounded-md px-2 py-1'>
        score : {score}
        </div>
        <div className='border border-[#4B5563] rounded-md px-2 py-1'>
         time : {time}s
        </div>
    </div>
  )
}

export default Display