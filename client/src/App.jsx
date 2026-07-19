import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/layout';
import { Auth, Dashboard, Projects, Team, Analytics, Settings } from './pages';
import { AccessibilityProvider } from './components/AccessibilityProvider';
import useAuthStore from './stores/authStore';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div 
        role="main"
        aria-label="Loading"
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary)'
        }}
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          {/* Loading spinner with ARIA */}
          <div 
            className="spinner" 
            role="status"
            aria-label="Loading application"
          />
          <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Loading...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
};

const App = () => {
  const { init, isAuthenticated } = useAuthStore();

  useEffect(() => {
    init();
  }, []);

  return (
    <AccessibilityProvider>
      <div className="app">
        <Routes>
          <Route
            path="/auth"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Auth />}
          />
          
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route 
              path="dashboard" 
              element={<Dashboard />} 
            />
            <Route 
              path="projects" 
              element={<Projects />} 
            />
            <Route 
              path="projects/:id" 
              element={<Projects />} 
            />
            <Route 
              path="team" 
              element={<Team />} 
            />
            <Route 
              path="analytics" 
              element={<Analytics />} 
            />
            <Route 
              path="settings" 
              element={<Settings />} 
            />
          </Route>

          <Route 
            path="*" 
            element={<Navigate to="/dashboard" replace />} 
          />
        </Routes>
      </div>
    </AccessibilityProvider>
  );
};

export default App;
