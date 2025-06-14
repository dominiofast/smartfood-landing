import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { AIProvider } from './contexts/AIContext';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import StoreManagement from './pages/StoreManagement';
import UserManagement from './pages/UserManagement';
import AIAssistant from './pages/AIAssistant';
import Reports from './pages/Reports';
import Orders from './pages/Orders';
import MenuManager from './pages/MenuManager';
import DigitalMenu from './pages/DigitalMenu';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <AuthProvider>
        <AIProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/menu" element={<DigitalMenu />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                {/* SuperAdmin Routes */}
                <Route path="/superadmin" element={<ProtectedRoute allowedRoles={['superadmin']} />}>
                  <Route index element={<SuperAdminDashboard />} />
                  <Route path="stores" element={<StoreManagement />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="orders" element={<Orders />} />
                  <Route path="menu" element={<MenuManager />} />
                  <Route path="ai-assistant" element={<AIAssistant />} />
                  <Route path="reports" element={<Reports />} />
                </Route>
                
                {/* Manager Routes */}
                <Route path="/manager" element={<ProtectedRoute allowedRoles={['manager', 'superadmin']} />}>
                  <Route index element={<Navigate to="/manager/orders" replace />} />
                  <Route path="orders" element={<Orders />} />
                  <Route path="menu" element={<MenuManager />} />
                  <Route path="store" element={<StoreManagement />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="ai-assistant" element={<AIAssistant />} />
                  <Route path="reports" element={<Reports />} />
                </Route>
              </Route>
            </Route>
            
            {/* Catch all - Redirect to landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AIProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;