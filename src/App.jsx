import React from 'react'
import Display from './components/Display'
import Game from './components/Game'

const App = () => {
  return (
    <div className='min-h-screen bg-gray-900 pb-20'>
      <Display />
      <Game />
    </div>
  )
}

export default App