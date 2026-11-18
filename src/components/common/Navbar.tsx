import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Search, LogOut, Database, ShieldCheck, AlertCircle } from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, signOut, isConfigured } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/resources?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150 ${
      isActive
        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand & Nav Links */}
        <div className="flex items-center gap-8">
          <NavLink to="/" className="focus:outline-none">
            <Logo />
          </NavLink>

          <nav className="hidden md:flex items-center space-x-1.5 bg-slate-100/70 p-1 rounded-full border border-slate-200/60">
            <NavLink to="/" end className={navLinkClasses}>
              Overview
            </NavLink>
            <NavLink to="/goals" className={navLinkClasses}>
              Learning Goals
            </NavLink>
            <NavLink to="/resources" className={navLinkClasses}>
              Resource Library
            </NavLink>
          </nav>
        </div>

        {/* Right: Search & User Profile */}
        <div className="flex items-center gap-3.5">
          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} className="relative hidden sm:block w-48 lg:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search queue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-slate-100 hover:bg-slate-150 focus:bg-white text-slate-800 placeholder-slate-400 rounded-full border border-slate-200/80 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </form>

          {/* User profile with dropdown */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2.5 p-1 pl-1.5 pr-2.5 rounded-full hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-blue-600/20 bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs shrink-0">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <span>{user?.name?.[0]?.toUpperCase() || 'U'}</span>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-slate-700 max-w-[120px] truncate">
                {user?.name || user?.email?.split('@')[0] || 'Elena Vance'}
              </span>
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onClick={() => setMenuOpen(false)}
              >
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'User'}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email || 'user@example.com'}</p>
                </div>

                <div className="px-4 py-2 text-[11px] border-b border-slate-100 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-slate-600">Database:</span>
                  {isConfigured ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                      <ShieldCheck className="w-3 h-3" /> Supabase Live
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                      <AlertCircle className="w-3 h-3" /> Preview Session
                    </span>
                  )}
                </div>

                <button
                  onClick={() => signOut()}
                  className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile nav pills */}
      <div className="flex md:hidden px-4 pb-2.5 overflow-x-auto space-x-1.5 scrollbar-none">
        <NavLink to="/" end className={navLinkClasses}>
          Overview
        </NavLink>
        <NavLink to="/goals" className={navLinkClasses}>
          Learning Goals
        </NavLink>
        <NavLink to="/resources" className={navLinkClasses}>
          Resource Library
        </NavLink>
      </div>
    </header>
  );
};
