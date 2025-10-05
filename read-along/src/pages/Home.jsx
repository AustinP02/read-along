import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import styles from "./Home.module.css";

function Home() {
  const [user, setUser] = useState(null);

  // Check if a user is logged in when the page loads
  useEffect(() => {
    async function fetchUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    }

    fetchUser();

    // Subscribe to auth state changes (login/logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    // Cleanup listener on unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className={styles.homeContainer}>
      <h1>Welcome to Read Along!</h1>
      <p>Where reading has never been made easier</p>

      <div className={styles.signupLoginBtns}>
        {user ? (
          <Link to="/lesson">
            <button>Go to Lessons</button>
          </Link>
        ) : (
          <Link to="/signup">
            <button>Sign Up / Login</button>
          </Link>
        )}

        <Link to="/about">
          <button>About</button>
        </Link>
      </div>
    </div>
  );
}

export default Home;
