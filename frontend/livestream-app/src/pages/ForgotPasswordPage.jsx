import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import '../styles/login.css';
import '../styles/global.css';
import '../styles/responsive.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;
const redirectHost = window.location.origin;


const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${redirectHost}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('If an account exists for that email, a password reset link has been sent.');
    }
  };

  return (
    <div className="login-container">
      <h2>Reset Password</h2>
      {message && <p>{message}</p>}
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleReset}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
        <button className="btn" type="submit">Send Reset Link</button>
      </form>
      <p style={{ marginTop: '25px' }}>
        <Link to="/login" className="btn">
            ← Back to Login
        </Link>
      </p>
    </div>
  );
};

export default ForgotPasswordPage;
