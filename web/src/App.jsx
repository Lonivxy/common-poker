import { Route, Routes } from 'react-router'
import { GamePage } from './pages/GamePage'
import { HomePage } from './pages/HomePage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/game/:roomId" element={<GamePage />} />
    </Routes>
  )
}

export default App
