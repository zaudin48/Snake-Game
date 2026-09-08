import React from 'react'

const Display = () => {
  return (
    <div className='text-gray-300 text-md font-sm flex justify-between items-center h-10  px-10 pt-10'>
        <div className='border border-[#4B5563] rounded-md px-1 py-1'>
         high score: 0
        </div>
        <div className='border border-[#4B5563] rounded-md px-1 py-1'>
        score: 0
        </div>
        <div className='border border-[#4B5563] rounded-md px-1 py-1'>
         time: 0 
        </div>
    </div>
  )
}

export default Display