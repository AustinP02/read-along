import { useLocation } from "react-router-dom";
import NavBar from "./NavBar";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import About from "./pages/About";
import Profile from "./pages/Profile";
import Lesson from "./pages/Lesson";
import { Routes, Route } from "react-router-dom";

function App() {
  const location = useLocation();

  const hideNavBar = false;

  return (
    <>
      {!hideNavBar && <NavBar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/lesson" element={<Lesson />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </>
  );
}

export default App;
