import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import '../styles/login.css';
import '../styles/global.css';
import '../styles/responsive.css';

const LoginPage = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!loading && user) {
      navigate('/home');
    }
  }, [user, loading, navigate]);

  if (loading) return <div>Loading...</div>;

  const handleGoogleLogin = async () => {
    const { error, url } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/oauth/callback',
      },
    });

    if (error) {
      console.error('Google login error:', error.message);
      setErr('Google login failed.');
    } else if (url) {
      window.location.assign(url);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setErr('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login failed:', error.message);
      setErr('Invalid email or password.');
    }
  };

  return (
    <div className="login-container">
      <h1>STAMPEDESTREAM</h1>
      <h2>Login</h2>
      {err && <p className="error">{err}</p>}
      
      <form onSubmit={handleEmailLogin}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button className="btn" type="submit">Log In</button>
      </form>

      <p>Don't have an account? <Link to="/register">Sign up</Link></p>

      <p><Link to="/forgot-password">Forgot your password?</Link></p>

      <div style={{ marginTop: '20px' }}>
        <p>or</p>
        <button className="btn" onClick={handleGoogleLogin}>
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
