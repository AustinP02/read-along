
import { useState } from 'react';
import './signup.css';

function Signup() {
  const [currentPage, setCurrentPage] = useState('login');
  const [username, setUsername] = useState('');
  const [signupError, setSignupError] = useState('');
  const [emailError, setEmailError] = useState('');
  
  const takenUsernames = ['akash', 'troy', 'chad'];

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  // Welcome form state
  const [country, setCountry] = useState('');
  const [age, setAge] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    alert(`Logged in as ${loginUsername}! (Demo only, no real authentication)`);
    setLoginUsername('');
    setLoginPassword('');
  };

  const handleSignup = (e) => {
    e.preventDefault();
    setSignupError('');

    if (takenUsernames.includes(signupUsername.toLowerCase())) {
      setSignupError('Username is already taken!');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setSignupError('Passwords do not match!');
      return;
    }

    if (!signupUsername || !signupPassword || !signupEmail) {
      setSignupError('All fields are required!');
      return;
    }

    setUsername(signupUsername);
    setCurrentPage('welcome');
    setSignupUsername('');
    setSignupEmail('');
    setSignupPassword('');
    setSignupConfirmPassword('');
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

  const handleWelcome = (e) => {
    e.preventDefault();
    alert(`Welcome ${username}! You are ${age} years old from ${country}.`);
    setCountry('');
    setAge('');
    setCurrentPage('login');
  };

  return (
    <div className="signup-page">
      {/* Decorative flags */}
      <img src="https://flagcdn.com/w40/us.png" alt="USA" className="flag flag1" />
      <img src="https://flagcdn.com/w40/in.png" alt="India" className="flag flag2" />
      <img src="https://flagcdn.com/w40/fr.png" alt="France" className="flag flag3" />
      <img src="https://flagcdn.com/w40/jp.png" alt="Japan" className="flag flag4" />
      <img src="https://flagcdn.com/w40/br.png" alt="Brazil" className="flag flag5" />
      <img src="https://flagcdn.com/w40/gb.png" alt="UK" className="flag flag6" />

      {/* Header */}
      <header className="signup-header">
        <h1>ReadAlong</h1>
        <p>Helping kids and non-native speakers learn through reading!</p>
      </header>

      {/* Login Section */}
      {currentPage === 'login' && (
        <div className="container">
          <h2>Login</h2>
          <div>
            <label>Username</label>
            <input
              type="text"
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              placeholder="Enter your username"
            />

            <label>Password</label>
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="Enter your password"
            />

            <button onClick={handleLogin}>Login</button>
          </div>
          <div className="link-text">
            <p>
              Don't have an account?{' '}
              <span onClick={() => setCurrentPage('signup')}>
                Set up an account
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Signup Section */}
      {currentPage === 'signup' && (
        <div className="container">
          <h2>Sign Up</h2>
          <div>
            {signupError && (
              <div className="error-msg">{signupError}</div>
            )}

            <label>Username</label>
            <input
              type="text"
              value={signupUsername}
              onChange={(e) => setSignupUsername(e.target.value)}
              placeholder="Enter your username"
            />

            <label>Email</label>
            <div className="email-widget">
              <input
                type="email"
                value={signupEmail}
                onChange={handleEmailChange}
                placeholder="Enter your email"
              />
              <span className="email-icon">📧</span>
            </div>
            {emailError && (
              <div className="error-msg email-error">{emailError}</div>
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
          <div className="link-text">
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
        <div className="container">
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