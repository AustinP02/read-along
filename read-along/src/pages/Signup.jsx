import { useState } from 'react';
import { supabase } from '../supabaseClient';
import styles from './Signup.module.css';

function Signup() {
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
      // Redirect to profile or home page
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
      {/* ... rest of your JSX remains the same ... */}
      
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
    </div>
  );
}

export default Signup;