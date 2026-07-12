import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children, adminOnly, employerOnly }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading-spinner">Loading...</div>;

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && user.userType !== 'admin') {
    return <Navigate to="/" />;
  }

  if (employerOnly && user.userType !== 'employer' && user.userType !== 'admin') {
    return <Navigate to="/" />;
  }

  return children;
}