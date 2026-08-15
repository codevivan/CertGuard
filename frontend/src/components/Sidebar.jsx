import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  FileBadge,
  Award,
  Layers,
  FileCheck2,
  Activity,
  PlusCircle,
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Events', path: '/events', icon: Calendar },
    { label: 'Templates', path: '/templates', icon: Layers },
    { label: 'Single Generator', path: '/generate/single', icon: PlusCircle },
    { label: 'Bulk CSV Generator', path: '/generate/bulk', icon: FileBadge },
    { label: 'Verification Logs', path: '/logs', icon: Activity },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-slate-800/80 bg-slate-950/60 hidden md:block min-h-[calc(100vh-4rem)] p-4">
      <div className="space-y-6">
        <div>
          <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Main Management
          </h3>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                      isActive
                        ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold shadow-md shadow-blue-500/5'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800/60">
          <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Public Utilities
          </h3>
          <NavLink
            to="/verify"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
              }`
            }
          >
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
            Verify Portal
          </NavLink>
        </div>

        {user && (
          <div className="mt-8 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
            <span className="text-slate-400 font-medium">Signed in as:</span>
            <div className="font-semibold text-slate-200 truncate mt-0.5">{user.email}</div>
            <div className="inline-block mt-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">
              Role: {user.role}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
