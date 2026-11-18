import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { OverviewPage } from './pages/OverviewPage';
import { GoalsPage } from './pages/GoalsPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { AuthPage } from './pages/AuthPage';
import { Database, X } from 'lucide-react';

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isConfigured } = useAuth();
  const [showConfigNotice, setShowConfigNotice] = useState(true);

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
      {/* Banner when Supabase credentials can be plugged in */}
      {!isConfigured && showConfigNotice && (
        <aside aria-label="Supabase setup notice" className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white text-xs px-4 py-2.5 flex items-center justify-between shadow-sm z-50">
          <div className="max-w-7xl mx-auto flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1 font-bold bg-white/20 px-2 py-0.5 rounded-full text-[10px]">
              <Database className="w-3 h-3 text-blue-200" /> Supabase Ready
            </span>
            <span>
              Application running with real-time UI data. Add your <code className="bg-black/20 px-1.5 py-0.5 rounded font-mono text-[11px]">VITE_SUPABASE_URL</code> &amp; <code className="bg-black/20 px-1.5 py-0.5 rounded font-mono text-[11px]">VITE_SUPABASE_ANON_KEY</code> to <code className="bg-black/20 px-1.5 py-0.5 rounded font-mono text-[11px]">.env</code> and run the provided SQL migration for live cloud persistence.
            </span>
          </div>
          <button
            onClick={() => setShowConfigNotice(false)}
            className="p-1 hover:bg-white/20 rounded-full transition-colors ml-2 shrink-0"
            title="Dismiss notice"
          >
            <X className="w-3.5 h-3.5 text-white" />
          </button>
        </aside>
      )}

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
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/login" element={<Navigate to="/auth" replace />} />
            <Route path="/signup" element={<Navigate to="/auth" replace />} />

            <Route
              path="/"
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

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
    </HashRouter>
    </AuthProvider >
  );
};

export default App;
