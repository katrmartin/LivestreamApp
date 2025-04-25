import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const AdminRoute = () => {
  const { user, loading } = useContext(AuthContext);

  console.log("AdminRoute:", { user, loading });

  if (loading || user === undefined) {
    return <div>Loading auth...</div>;
  }

  if (!user || !user.is_admin) {
    console.log("AdminRoute: Access denied, redirecting to /login");
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default AdminRoute;
