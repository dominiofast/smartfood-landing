import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { AIProvider } from './contexts/AIContext';

// Pages
import Login from './pages/Login';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import StoreManagement from './pages/StoreManagement';
import UserManagement from './pages/UserManagement';
import AIAssistant from './pages/AIAssistant';
import Reports from './pages/Reports';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AIProvider>
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
            
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  {/* SuperAdmin Routes */}
                  <Route path="/superadmin" element={<ProtectedRoute allowedRoles={['superadmin']} />}>
                    <Route index element={<SuperAdminDashboard />} />
                    <Route path="stores" element={<StoreManagement />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="ai-assistant" element={<AIAssistant />} />
                    <Route path="reports" element={<Reports />} />
                  </Route>
                  
                  {/* Manager Routes */}
                  <Route path="/manager" element={<ProtectedRoute allowedRoles={['manager', 'superadmin']} />}>
                    <Route index element={<ManagerDashboard />} />
                    <Route path="store" element={<StoreManagement />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="ai-assistant" element={<AIAssistant />} />
                    <Route path="reports" element={<Reports />} />
                  </Route>
                </Route>
              </Route>
              
              {/* Default Redirect */}
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </Router>
        </AIProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App; 