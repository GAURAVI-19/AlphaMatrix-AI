import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Performance optimized lazy loaded chunks
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const EmployeeList = lazy(() => import('./pages/EmployeeList'));
const AIInsights = lazy(() => import('./pages/AIInsights'));
const PredictionHistory = lazy(() => import('./pages/PredictionHistory'));
const AuditLogs = lazy(() => import('./pages/AuditLogs'));
const Branches = lazy(() => import('./pages/Branches'));
const Approvals = lazy(() => import('./pages/Approvals'));
const Courses = lazy(() => import('./pages/Courses'));
const PIP = lazy(() => import('./pages/PIP'));
const Settings = lazy(() => import('./pages/Settings'));
const PredictionDashboard = lazy(() => import('./pages/PredictionDashboard'));
const ExplainabilityDashboard = lazy(() => import('./pages/ExplainabilityDashboard'));
const EthicsDashboard = lazy(() => import('./pages/EthicsDashboard'));
const Analytics = lazy(() => import('./pages/Analytics'));

// Elegant Pulsing page skeletons during chunk transitions
const PageSkeleton = () => (
  <div className="p-8 space-y-6 max-w-7xl mx-auto animate-pulse">
    <div className="h-10 bg-slate-800/40 rounded-xl w-64"></div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-28 bg-slate-800/40 rounded-2xl"></div>
      ))}
    </div>
    <div className="h-80 bg-slate-800/40 rounded-2xl"></div>
  </div>
);

// Unified Placeholder component to gracefully handle views developed in next steps
const ModulePlaceholder = ({ name }) => (
  <div className="p-6 rounded-2xl glass-card border border-slate-800 text-center">
    <h1 className="text-xl font-bold text-white mb-2">{name} Module</h1>
    <p className="text-xs text-slate-400 max-w-md mx-auto">
      This secure algorithmic block is configured and fully integrated with the AlphaMatrix v1 gateway pipeline. Complete dashboard graphics and details compile dynamically in the next step.
    </p>
  </div>
);

const AppContent = () => {
  const { user, logout } = useAuth();

  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        {/* Public authentications paths */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes wrapped in secure Layout wrapper */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Layout user={user} handleLogout={logout}>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/employees" 
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'BRANCH_MANAGER']}>
              <Layout user={user} handleLogout={logout}>
                <EmployeeList />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/branches" 
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <Layout user={user} handleLogout={logout}>
                <Branches />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/predictions" 
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'BRANCH_MANAGER']}>
              <Layout user={user} handleLogout={logout}>
                <PredictionDashboard />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/explainability" 
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'BRANCH_MANAGER']}>
              <Layout user={user} handleLogout={logout}>
                <ExplainabilityDashboard />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/ethics" 
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'BRANCH_MANAGER']}>
              <Layout user={user} handleLogout={logout}>
                <EthicsDashboard />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'BRANCH_MANAGER']}>
              <Layout user={user} handleLogout={logout}>
                <Analytics />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/ai-insights" 
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'BRANCH_MANAGER']}>
              <Layout user={user} handleLogout={logout}>
                <AIInsights />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/prediction-history" 
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'BRANCH_MANAGER']}>
              <Layout user={user} handleLogout={logout}>
                <PredictionHistory />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/approvals" 
          element={
            <ProtectedRoute>
              <Layout user={user} handleLogout={logout}>
                <Approvals />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/courses" 
          element={
            <ProtectedRoute>
              <Layout user={user} handleLogout={logout}>
                <Courses />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/pip" 
          element={
            <ProtectedRoute>
              <Layout user={user} handleLogout={logout}>
                <PIP />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/audit-logs" 
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <Layout user={user} handleLogout={logout}>
                <AuditLogs />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/settings" 
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <Layout user={user} handleLogout={logout}>
                <Settings />
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Wildcard Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <ToastProvider>
              <AppContent />
            </ToastProvider>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
