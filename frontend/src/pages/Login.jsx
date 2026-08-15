import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogIn, ArrowRight, KeyRound, Mail } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail('admin@certguard.com');
    setPassword('Admin@123');
  };

  const fillDemoOrganizer = () => {
    setEmail('organizer@certguard.com');
    setPassword('Organizer@123');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 shadow-xl shadow-blue-500/20 mb-4">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <h2 className="text-3xl font-extrabold font-heading text-white tracking-tight">
          CertGuard Sign In
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Enter your credentials to manage and issue verifiable digital certificates.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass-panel py-8 px-4 shadow-2xl rounded-2xl sm:px-10 border border-slate-800">
          
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@certguard.com"
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <KeyRound className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition duration-200 disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" /> Sign In to Dashboard
                </>
              )}
            </button>
          </form>

          {/* Quick Seed Fill Demo Buttons */}
          <div className="mt-6 pt-6 border-t border-slate-800/80">
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
              Quick Test Credentials
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={fillDemoAdmin}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 rounded-xl transition text-center"
              >
                🔑 Admin Demo
              </button>
              <button
                type="button"
                onClick={fillDemoOrganizer}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 rounded-xl transition text-center"
              >
                ⚡ Organizer Demo
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-blue-400 hover:underline">
              Create an Account
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};
