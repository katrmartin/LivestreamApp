import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/login.css';
import '../styles/global.css';
import '../styles/responsive.css';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');

    const { data, error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="login-container">
      <h2>Set New Password</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleUpdate}>
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="btn" type="submit">Update Password</button>
      </form>
      <p style={{ marginTop: '25px' }}>
        <Link to="/login" className="btn">
            ← Back to Login
        </Link>
      </p>
    </div>
  );
};

export default ResetPasswordPage;
