import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from './Signup.module.css';


function Signup() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('login');
  const [username, setUsername] = useState('');
  const [signupError, setSignupError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  // Welcome form state
  const [country, setCountry] = useState('');
  const [age, setAge] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSignupError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) throw error;

      alert(`Logged in successfully!`);
      setLoginEmail('');
      setLoginPassword('');
      navigate("/");
    } catch (error) {
      setSignupError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const checkUsernameAvailable = async (username) => {
    const { data, error } = await supabase
      .from('users')
      .select('username')
      .eq('username', username.toLowerCase())
      .single();

    return !data; // Returns true if username is available
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupError('');
    setLoading(true);

    try {
      // Validate inputs
      if (!signupUsername || !signupPassword || !signupEmail) {
        throw new Error('All fields are required!');
      }

      if (signupPassword !== signupConfirmPassword) {
        throw new Error('Passwords do not match!');
      }

      // Check if username is taken
      const isAvailable = await checkUsernameAvailable(signupUsername);
      if (!isAvailable) {
        throw new Error('Username is already taken!');
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
      });

      if (authError) throw authError;

      // Create user profile (this will be done via trigger or manually)
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email: signupEmail,
            username: signupUsername.toLowerCase(),
          }
        ]);

      if (profileError) throw profileError;

      // Initialize user stats
      const { error: statsError } = await supabase
        .from('user_stats')
        .insert([
          {
            user_id: authData.user.id,
            accuracy: 0,
            lessons_completed: 0,
            lessons_target: 30,
            current_streak: 0,
          }
        ]);

      if (statsError) throw statsError;

      setUsername(signupUsername);
      setCurrentPage('welcome');
      setSignupUsername('');
      setSignupEmail('');
      setSignupPassword('');
      setSignupConfirmPassword('');
    } catch (error) {
      setSignupError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    const email = e.target.value.trim();
    setSignupEmail(email);
    
    if (email && (!email.includes('@') || !email.includes('.'))) {
      setEmailError('Invalid email format!');
    } else {
      setEmailError('');
    }
  };

  const handleWelcome = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Update user profile with country and age
      const { error } = await supabase
        .from('users')
        .update({
          country: country,
          age: parseInt(age),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      alert(`Welcome ${username}! Your profile has been updated.`);
      // Redirect to home or profile page
    } catch (error) {
      setSignupError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.signupPage}>
      
      <img src="https://flagcdn.com/w40/us.png" alt="USA" className={`${styles.flag} ${styles.flag1}`} />
      <img src="https://flagcdn.com/w40/in.png" alt="India" className={`${styles.flag} ${styles.flag2}`} />
      <img src="https://flagcdn.com/w40/fr.png" alt="France" className={`${styles.flag} ${styles.flag3}`} />
      <img src="https://flagcdn.com/w40/jp.png" alt="Japan" className={`${styles.flag} ${styles.flag4}`} />
      <img src="https://flagcdn.com/w40/br.png" alt="Brazil" className={`${styles.flag} ${styles.flag5}`} />
      <img src="https://flagcdn.com/w40/gb.png" alt="UK" className={`${styles.flag} ${styles.flag6}`} />
     
      <header className={styles.signupHeader}>
        <h1>ReadAlong</h1>
        <p>Helping kids and non-native speakers learn through reading!</p>
      </header>
      
      {/* Just update button text to show loading state */}
      {currentPage === 'login' && (
        <div className={styles.container}>
          <h2>Login</h2>
          <div>
            {signupError && (
              <div className={styles.errorMsg}>{signupError}</div>
            )}
            <label>Email</label>
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="Enter your email"
            />

            <label>Password</label>
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="Enter your password"
            />

            <button onClick={handleLogin} disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
          <div className={styles.linkText}>
            <p>
              Don't have an account?{' '}
              <span onClick={() => setCurrentPage('signup')}>
                Set up an account
              </span>
            </p>
          </div>
        </div>
      )}
      
      {/* Similar updates for signup and welcome sections */}
            {/* Signup Section */}
      {currentPage === 'signup' && (
        <div className={styles.container}>
          <h2>Sign Up</h2>
          <div>
            {signupError && (
              <div className={styles.errorMsg}>{signupError}</div>
            )}

            <label>Username</label>
            <input
              type="text"
              value={signupUsername}
              onChange={(e) => setSignupUsername(e.target.value)}
              placeholder="Enter your username"
            />

            <label>Email</label>
            <div className={styles.emailWidget}>
              <input
                type="email"
                value={signupEmail}
                onChange={handleEmailChange}
                placeholder="Enter your email"
              />
              <span className={styles.emailIcon}>📧</span>
            </div>
            {emailError && (
              <div className={`${styles.errorMsg} ${styles.emailError}`}>{emailError}</div>
            )}

            <label>Password</label>
            <input
              type="password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              placeholder="Enter your password"
            />

            <label>Confirm Password</label>
            <input
              type="password"
              value={signupConfirmPassword}
              onChange={(e) => setSignupConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
            />

            <button onClick={handleSignup}>Create Account</button>
          </div>
          <div className={styles.linkText}>
            <p>
              Already have an account?{' '}
              <span onClick={() => setCurrentPage('login')}>
                Login here
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Welcome Section */}
      {currentPage === 'welcome' && (
        <div className={styles.container}>
          <h2>Welcome, {username}!</h2>
          <div>
            <label>Which country are you from?</label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Enter your country"
            />

            <label>Your Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Enter your age"
            />

            <button onClick={handleWelcome}>Submit</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Signup;