import './navbar.css';
import { Link, useNavigate } from 'react-router-dom';
import logo from './assets/read-along-logo.png';
import { supabase } from './supabaseClient';
import { useState, useEffect } from 'react';

function NavBar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); 

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user);
    };
    getUser();
    
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/signup');
  };

  return (
    <nav className="nav">
      <Link to="/">
        <img className="logo" src={logo} alt="Read Along logo" />
      </Link>
      <ul>
        <li><Link to="/about">About</Link></li>

        {user ? (
          <>
            <li><Link to="/lesson">Lesson</Link></li>
            <li><Link to="/profile">Profile</Link></li>
            <li>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </li>
          </>
        ) : (
          <li><Link to="/signup">Sign Up / Login</Link></li>
        )}
      </ul>
    </nav>
  );
}

export default NavBar;
