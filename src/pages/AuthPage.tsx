import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Target, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { useAuth } from '../context/AuthContext';

export const AuthPage: React.FC = () => {
  const { user, signIn, signUp, signInAsDemo, isConfigured } = useAuth();
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signUpSuccessMessage, setSignUpSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError(null);
    setSignUpSuccessMessage(null);

    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isSignUp) {
        const { error: signUpErr } = await signUp(email.trim(), password, name.trim());
        if (signUpErr) {
          if (signUpErr.message.toLowerCase().includes('rate limit')) {
            // Attempt direct sign in in case user was already created on the first attempt
            const { error: signInErr } = await signIn(email.trim(), password);
            if (!signInErr) {
              navigate('/overview');
              return;
            }
            setError('Email rate limit exceeded. Your account was likely already created — click "Sign In" below to log in, or turn off "Confirm email" in your Supabase Auth settings.');
          } else {
            setError(signUpErr.message);
          }
        } else {
          // If Supabase created the user, attempt instant sign in
          const { error: autoSignInErr } = await signIn(email.trim(), password);
          if (!autoSignInErr) {
            navigate('/overview');
          } else {
            setSignUpSuccessMessage(
              'Account created! You can now click "Sign In" below to enter your workspace.'
            );
          }
        }
      } else {
        const { error: signInErr } = await signIn(email.trim(), password);
        if (signInErr) {
          setError(signInErr.message);
        } else {
          navigate('/overview');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = () => {
    signInAsDemo();
    navigate('/overview');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 lg:p-10">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        {/* Left Side: Brand Visual Card matching Figma */}
        <div className="lg:col-span-5 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top Logo */}
          <div className="relative z-10 space-y-6">
            <Logo whiteText size="lg" />

            <div className="space-y-3">
              <p className="text-[11px] font-extrabold tracking-widest uppercase text-blue-200">
                Focus on what matters. Keep everything you learn.
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                Master one skill before moving to the next.
              </h2>
            </div>
          </div>

          {/* Middle: Preview card matching Figma screenshot */}
          <div className="relative z-10 my-6 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-white">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white leading-none">
                    Active Primary Focus: UX/UI Design
                  </div>
                  <div className="text-[10px] text-blue-100 mt-0.5">
                    4 Curated Resources • 1/1 Single-Stream
                  </div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400 text-slate-900">
                In Progress
              </span>
            </div>

            {/* Visual Wave graphic */}
            <div className="relative h-12 flex items-center">
              <svg className="w-full h-8 overflow-visible" viewBox="0 0 200 40">
                <path
                  d="M0 30 Q 50 30, 80 15 T 160 10 T 200 25"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.3)"
                  strokeWidth="3"
                />
                <path
                  d="M0 30 Q 50 30, 80 15"
                  fill="none"
                  stroke="#4ade80"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <circle cx="80" cy="15" r="4.5" fill="#4ade80" stroke="#ffffff" strokeWidth="2" />
              </svg>
            </div>

            {/* 3 mini stats row */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/10 text-center">
              <div className="bg-white/10 rounded-xl p-2">
                <div className="text-sm font-extrabold text-white">1 Active</div>
                <div className="text-[9px] text-blue-200">Primary Goal</div>
              </div>
              <div className="bg-white/10 rounded-xl p-2">
                <div className="text-sm font-extrabold text-white">3 Queued</div>
                <div className="text-[9px] text-blue-200">Goal Backlog</div>
              </div>
              <div className="bg-white/10 rounded-xl p-2">
                <div className="text-sm font-extrabold text-white">10 Links</div>
                <div className="text-[9px] text-blue-200">Resource Vault</div>
              </div>
            </div>
          </div>

          {/* Bottom tag */}
          <div className="relative z-10 text-[11px] text-blue-100/80">
            Deliberate Single-Focus Architecture
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-6">
            {/* If user already has an active session, show a shortcut to enter directly */}
            {user && (
              <div className="p-4 bg-blue-50/90 border border-blue-200 rounded-2xl flex items-center justify-between gap-3 shadow-sm animate-in fade-in">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-sm">
                    {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      Signed in as {user.name || user.email}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/overview')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shrink-0 transition-colors shadow-sm shadow-blue-500/20 flex items-center gap-1.5"
                >
                  <span>Enter Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {isSignUp ? 'Create your workspace' : 'Welcome back'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {isSignUp
                  ? 'Start organizing your skills and resources with deliberate single-stream focus.'
                  : 'Sign in to access your learning focus and resource vault.'}
              </p>
            </div>

            {/* Quick Demo Preview Button */}
            {!isConfigured && (
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full py-2.5 px-4 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200/90 text-blue-700 text-xs font-bold transition-all flex items-center justify-center gap-2 group shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-blue-600 group-hover:rotate-12 transition-transform" />
                <span>Instant Demo: Continue as Elena Vance</span>
              </button>
            )}

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider shrink-0">
                {isConfigured ? 'or enter credentials' : 'or sign in with email'}
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Elena Vance"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50/70 focus:bg-white text-slate-900 placeholder-slate-400 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="alex@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50/70 focus:bg-white text-slate-900 placeholder-slate-400 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 text-sm bg-slate-50/70 focus:bg-white text-slate-900 placeholder-slate-400 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {!isSignUp && (
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Remember me</span>
                  </label>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Success Message */}
              {signUpSuccessMessage && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{signUpSuccessMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Please wait...</span>
                  </>
                ) : (
                  <>
                    <span>{isSignUp ? 'Create workspace' : 'Sign In to Focora'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Toggle Sign Up / In */}
            <div className="text-center text-xs text-slate-500 pt-2">
              {isSignUp ? (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false);
                      setError(null);
                    }}
                    className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Sign In
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true);
                      setError(null);
                    }}
                    className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Create workspace
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
