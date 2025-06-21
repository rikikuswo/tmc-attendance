import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './App.css'

function App() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/form')
    }, 3000) // 3 detik splash screen

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="flex items-center justify-center h-screen bg-blue-500 text-white text-3xl font-bold">
      Splash Screen
    </div>
  )
}

export default App