import { useState } from 'react'
import NavBar from './NavBar'
import About from './pages/About'
import Profile from './pages/Profile'
import Home from './pages/Home'
import Signup from './pages/Signup'
import {Route, Routes} from "react-router-dom"

function App() {
  const [count, setCount] = useState(0)
  
  return (
    <>
      <NavBar />
      <div className="container">
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/about' element={<About />} />
          <Route path='/profile' element={<Profile />} />
          <Route path='/signup' element={<Signup />} />
        </Routes>
      </div>
    </>
  )
}

export default App
