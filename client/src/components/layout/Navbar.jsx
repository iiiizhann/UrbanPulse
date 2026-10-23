import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Activity, ShieldCheck, LogOut, ChevronDown } from 'lucide-react';

export const Navbar = ({ selectedCity, onSelectCity, cities = [] }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 px-4 sm:px-6 lg:px-8 pt-4 pb-2">
      <div className="max-w-7xl mx-auto apple-glass rounded-2xl px-5 h-16 flex items-center justify-between transition-all duration-300">
        {/* Brand */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
            <Activity className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-800">
            Urban<span className="text-teal-600 font-extrabold">Pulse</span>
            <span className="ml-2 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-slate-200/60 text-slate-600">
              OS
            </span>
          </span>
        </Link>

        {/* Center / Right Controls */}
        <div className="flex items-center space-x-3">
          {/* City Segmented Picker */}
          {cities.length > 0 && location.pathname === '/' && (
            <div className="relative">
              <select
                value={selectedCity}
                onChange={(e) => onSelectCity(e.target.value)}
                className="appearance-none apple-capsule text-xs font-semibold text-slate-700 pl-3.5 pr-8 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/40 cursor-pointer transition-all hover:bg-white"
              >
                {cities.map((city) => (
                  <option key={city} value={city}>
                    📍 {city}
                  </option>
                ))}
              </select>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          {/* Admin Navigation */}
          {user?.role === 'Admin' && (
            <Link
              to="/admin"
              className="apple-capsule text-xs font-semibold text-slate-700 px-3.5 py-2 rounded-xl hover:text-teal-600 hover:bg-white transition-all flex items-center space-x-1.5"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
              <span>Audit Console</span>
            </Link>
          )}

          {/* Auth Controls */}
          {user ? (
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-300/60">
              <span className="text-xs font-medium text-slate-600 hidden sm:inline">
                {user.name}
              </span>
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-500 transition-colors rounded-lg hover:bg-white/50"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-xs font-semibold px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-all hover:shadow-slate-900/10 active:scale-95"
            >
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};