import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import '../styles/login.css';
import '../styles/global.css';
import '../styles/responsive.css';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setErr('');
    setSuccess('');

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: name },
        redirectTo: 'http://localhost:3000/oauth/callback',
      },
    });

    if (error) {
      console.error('Registration failed:', error.message);
      setErr(error.message);
    } else {
      setSuccess('Check your email to confirm your account!');
    }
  };

  const handleGoogleRegister = async () => {
    const { error, url } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/oauth/callback',
      },
    });

    if (error) {
      console.error('Google signup/login error:', error.message);
      setErr('Google login failed.');
    } else if (url) {
      window.location.assign(url);
    }
  };

  return (
    <div className="login-container">
      <h1>STAMPEDESTREAM</h1>
      <h2>Create Account</h2>
      {err && <p className="error">{err}</p>}
      {success && <p className="success">{success}</p>}

      <form onSubmit={handleRegister}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full Name"
          required
        />
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
        <button className="btn" type="submit">Sign Up</button>
      </form>

      <p>Already have an account? <Link to="/login">Log in</Link></p>

      <div style={{ marginTop: '20px' }}>
        <p>or</p>
        <button className="btn" onClick={handleGoogleRegister}>
          Sign up or log in with Google
        </button>
      </div>
    </div>
  );
};

export default RegisterPage;
