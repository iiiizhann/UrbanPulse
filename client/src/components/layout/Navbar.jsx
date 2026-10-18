import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Activity, LogOut, User, ShieldAlert } from 'lucide-react';

export const Navbar = ({ selectedCity, onSelectCity, cities }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3">
          <div className="bg-teal-600 p-2 rounded-lg text-white">
            <Activity className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Urban<span className="text-teal-600">Pulse</span>
          </span>
          <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 font-semibold px-2 py-0.5 rounded-full ml-2">
            Smart City OS
          </span>
        </Link>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label htmlFor="city-select" className="text-xs font-semibold text-slate-500 uppercase">
              City:
            </label>
            <select
              id="city-select"
              value={selectedCity}
              onChange={(e) => onSelectCity(e.target.value)}
              className="bg-slate-100 border border-slate-300 text-slate-800 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block px-3 py-1.5 font-medium cursor-pointer"
            >
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div className="h-6 w-px bg-slate-200"></div>

          {user ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <User className="h-4 w-4 text-slate-400" />
                <span className="font-medium text-slate-800">{user.name}</span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                  {user.role}
                </span>

                {user.role === 'Admin' && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center space-x-1 text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 px-2.5 py-1 rounded-md transition-colors"
                  >
                    <ShieldAlert className="h-3 w-3" />
                    <span>ETL Logs</span>
                  </Link>
                )}
              </div>
              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-sm font-semibold text-teal-600 hover:text-teal-700"
            >
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};