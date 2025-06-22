import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import logo from './assets/images/tmc-logo.png'

function App() {
  const navigate = useNavigate()
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false)
      navigate('/form')
    }, 3000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="flex flex-col items-center">
        <div className="animate-pulse flex items-center justify-center">
          <img src={logo} alt="TMC" className="h-32" />
        </div>
        <p className="text-white mt-2 animate-fade-in-up">
          Loading...
        </p>
      </div>
    </div>
  )
}

export default App
