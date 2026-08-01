import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-purple-800 border-t-purple-400 animate-spin glow-purple"></div>
          <span className="text-xs text-purple-400 tracking-wider font-mono">SYNCHRONIZING SECURE TUNNEL...</span>
        </div>
      </div>
    );
  }

  // Redirect to login if user session is not active
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to dashboard if role access is insufficient
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
