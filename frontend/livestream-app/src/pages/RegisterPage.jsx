import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/login.css';
import '../styles/global.css';
import '../styles/responsive.css';

const RegisterPage = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setErr('');

    try {
      // Register user
      await axios.post('http://localhost:8000/register', {
        email,
        password,
        name
      });

      // Log in immediately after registration
      const res = await axios.post('http://localhost:8000/login', {
        email,
        password
      });

      const token = res.data.access_token;

      const me = await axios.get('http://localhost:8000/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      login(token, me.data);
      navigate('/home');
    } catch (error) {
      console.error(error);
      setErr(error.response?.data?.detail || 'Registration failed');
    }
  };

  return (
    <div className="login-container">
      <h2>Register</h2>
      {err && <p className="error">{err}</p>}
      <form onSubmit={handleRegister}>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" required />
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        <button className="btn" type="submit">Create Account</button>
      </form>
    </div>
  );
};

export default RegisterPage;
