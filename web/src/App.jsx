import { Route, Routes } from 'react-router'
import { GamePage } from './pages/GamePage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<main className="min-h-screen" />} />
      <Route path="/game/:roomId" element={<GamePage />} />
    </Routes>
  )
}

export default App
