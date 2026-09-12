import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AlertDetailPage from './pages/AlertDetailPage';
import AlertsPage from './pages/AlertsPage';
import BlockedIPsPage from './pages/BlockedIPsPage';
import Layout from './components/layout/Layout';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/alerts" 
        element={
          <ProtectedRoute>
            <Layout>
              <AlertsPage />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/alerts/:id" 
        element={
          <ProtectedRoute>
            <Layout>
              <AlertsPage />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/alerts/detail/:id" 
        element={
          <ProtectedRoute>
            <Layout>
              <AlertDetailPage />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/blocked" 
        element={
          <ProtectedRoute>
            <Layout>
              <BlockedIPsPage />
            </Layout>
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
          <AppRoutes />
          <Toaster position="top-right" toastOptions={{
            style: {
              background: '#1f2937',
              color: '#f3f4f6',
              border: '1px solid #374151'
            }
          }} />
        </div>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
