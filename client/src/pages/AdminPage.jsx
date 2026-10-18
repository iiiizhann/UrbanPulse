import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Activity, ArrowLeft, RefreshCw, CheckCircle2, XCircle, Play } from 'lucide-react';

export const AdminPage = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await analyticsApi.getPipelineLogs(25);
      setLogs(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch pipeline audit logs');
    } finally {
      setLoading(false);
    }
  };

  const handleManualTrigger = async () => {
    setTriggering(true);
    setActionMessage('');
    try {
      const res = await analyticsApi.triggerManualETL();
      setActionMessage(res.data.message);
      // Wait 1.5 seconds for workers to process and write audit logs, then reload logs
      setTimeout(() => {
        fetchLogs();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to trigger ingestion pipeline');
    } finally {
      setTriggering(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/" className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="bg-teal-600 p-2 rounded-lg text-white">
              <Activity className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Urban<span className="text-teal-600">Pulse</span> <span className="text-sm font-normal text-slate-500">/ Operational Console</span>
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleManualTrigger}
              disabled={triggering}
              className="flex items-center space-x-2 text-xs font-semibold px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-colors disabled:opacity-50"
            >
              <Play className={`h-3.5 w-3.5 ${triggering ? 'animate-spin' : 'fill-white'}`} />
              <span>{triggering ? 'Executing Pipeline...' : 'Run Ingestion Now'}</span>
            </button>

            <button
              onClick={fetchLogs}
              disabled={loading}
              className="flex items-center space-x-2 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Logs</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Pipeline Execution Logs</h1>
            <p className="text-sm text-slate-500">
              Audit trail of background data extraction, Zod validation, and deduplication jobs.
            </p>
          </div>
          <div className="text-xs bg-slate-100 px-3 py-1.5 rounded-full text-slate-600">
            Current Operator: <strong className="text-slate-900">{user?.name}</strong> ({user?.role})
          </div>
        </div>

        {actionMessage && (
          <div className="p-3.5 bg-teal-50 border border-teal-200 text-teal-800 rounded-xl text-xs flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="h-48 flex items-center justify-center text-slate-400">
            Querying audit trail...
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Pipeline</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Extracted</th>
                  <th className="px-6 py-3.5">Ingested</th>
                  <th className="px-6 py-3.5">Duration</th>
                  <th className="px-6 py-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-slate-900 text-xs">
                      {log.pipelineName}
                    </td>
                    <td className="px-6 py-4">
                      {log.executionStatus === 'SUCCESS' ? (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>SUCCESS</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="h-3 w-3" />
                          <span>FAILED</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">{log.recordsExtracted}</td>
                    <td className="px-6 py-4">{log.recordsIngested}</td>
                    <td className="px-6 py-4 font-mono text-xs">{log.durationMs}ms</td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};