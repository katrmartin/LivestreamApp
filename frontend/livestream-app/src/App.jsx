import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import StreamPage from './pages/StreamPage';
import AdminPage from './pages/AdminPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import OAuthCallback from './pages/OAuthCallback';
import AdminRoute from './components/AdminRoute';
import PrivateRoute from './components/PrivateRoute';
import { AuthContext } from './AuthContext';

const App = () => {
  const { loading } = useContext(AuthContext); 

  if (loading) return <div>Loading App...</div>;

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />

        {/* Protected routes */}
        <Route path="/home" element={<PrivateRoute><HomePage /></PrivateRoute>} />
        <Route path="/stream" element={<PrivateRoute><StreamPage /></PrivateRoute>} />

        {/* Admin-only route */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>

        {/* 404 fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default App;
