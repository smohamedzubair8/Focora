import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { OverviewPage } from './pages/OverviewPage';
import { GoalsPage } from './pages/GoalsPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { AuthPage } from './pages/AuthPage';

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading Focora Workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-800">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {children}
      </main>

      <footer className="border-t border-slate-200/80 bg-white/60 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Focora</span>
            <span>• Single-Stream Learning Prioritization</span>
          </div>
          <div>Master one skill before moving to the next.</div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          {/* Main entry: always relocate to login page first */}
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/login" element={<Navigate to="/auth" replace />} />
          <Route path="/signup" element={<Navigate to="/auth" replace />} />

          {/* Protected workspace routes */}
          <Route
            path="/overview"
            element={
              <ProtectedLayout>
                <OverviewPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/goals"
            element={
              <ProtectedLayout>
                <GoalsPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/resources"
            element={
              <ProtectedLayout>
                <ResourcesPage />
              </ProtectedLayout>
            }
          />

          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
