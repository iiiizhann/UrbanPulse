import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { Activity, Lock, Mail } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('izhan@example.com');
  const [password, setPassword] = useState('Password123');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await authApi.login({ email, password });
      login(res.data.token, res.data.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="inline-flex bg-teal-600 p-2.5 rounded-xl text-white mb-3">
            <Activity className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Sign in to UrbanPulse</h2>
          <p className="text-sm text-slate-500 mt-1">Smart City Operational Intelligence</p>
        </div>

        {error && (
          <div className="mb-4 text-xs bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Email</label>
            <div className="relative">
              <Mail className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-teal-500 focus:border-teal-500"
                placeholder="you@domain.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Password</label>
            <div className="relative">
              <Lock className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-teal-500 focus:border-teal-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            {submitting ? 'Verifying...' : 'Authenticate'}
          </button>
        </form>
      </div>
    </div>
  );
};