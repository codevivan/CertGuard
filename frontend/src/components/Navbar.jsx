import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogOut, User as UserIcon, CheckCircle2 } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to={user ? "/dashboard" : "/verify"} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold font-heading bg-gradient-to-r from-white via-slate-200 to-blue-400 bg-clip-text text-transparent">
                CertGuard
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-widest text-blue-400/80">
                VERIFICATION PLATFORM
              </span>
            </div>
          </Link>

          {/* Right Controls */}
          <div className="flex items-center gap-4">
            
            {/* Quick Public Verify Link */}
            <Link
              to="/verify"
              className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/60 text-slate-300 hover:text-white hover:border-blue-500/50 transition"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Public Verification Portal
            </Link>

            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-semibold text-slate-200">{user.name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {user.role}
                  </span>
                </div>

                <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg transition"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition"
                >
                  Get Started
                </Link>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
