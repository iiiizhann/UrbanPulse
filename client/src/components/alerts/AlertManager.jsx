import React, { useEffect, useState } from 'react';
import { alertService } from '../../services/alert.service.js';
import { CreateRuleModal } from './CreateRuleModal.jsx';

export const AlertManager = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const data = await alertService.getRules();
      setRules(data);
    } catch (err) {
      showNotice(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const showNotice = (msg, type = 'info') => {
    setStatusMessage({ msg, type });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleCreate = async (payload) => {
    await alertService.createRule(payload);
    showNotice('Alert rule successfully created!', 'success');
    fetchRules();
  };

  const handleToggle = async (rule) => {
    try {
      const updated = await alertService.toggleRule(rule._id, !rule.isActive);
      setRules((prev) => prev.map((r) => (r._id === rule._id ? { ...r, isActive: updated.isActive } : r)));
      showNotice(`Rule ${updated.isActive ? 'activated' : 'paused'}.`, 'success');
    } catch (err) {
      showNotice(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this alerting rule?')) return;
    try {
      await alertService.deleteRule(id);
      setRules((prev) => prev.filter((r) => r._id !== id));
      showNotice('Rule deleted permanently.', 'info');
    } catch (err) {
      showNotice(err.message, 'error');
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span>🛡️</span> Telemetry Alert Dispatcher
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time threshold evaluations dispatched to Discord Webhooks & Telegram.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition"
        >
          <span>+</span> New Rule
        </button>
      </div>

      {statusMessage && (
        <div
          className={`my-4 p-3 rounded-xl text-xs font-medium border ${
            statusMessage.type === 'error'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          }`}
        >
          {statusMessage.msg}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-sm text-slate-500 animate-pulse">
          Querying threshold rules from MongoDB...
        </div>
      ) : rules.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-sm">
          No automated alerting rules registered yet. Click <span className="text-indigo-400 font-medium">New Rule</span> to add one.
        </div>
      ) : (
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Target</th>
                <th className="px-4 py-3">Metric Condition</th>
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3">Cooldown Status</th>
                <th className="px-4 py-3">State</th>
                <th className="px-4 py-3 text-right rounded-r-lg">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {rules.map((rule) => {
                const cooldownActive =
                  rule.lastTriggeredAt &&
                  Date.now() - new Date(rule.lastTriggeredAt).getTime() < 60 * 60 * 1000;

                return (
                  <tr key={rule._id} className="hover:bg-slate-800/30 transition">
                    <td className="px-4 py-3 font-semibold text-white">
                      {rule.city}
                    </td>
                    <td className="px-4 py-3 font-mono">
                      <span className="text-slate-400">{rule.metric}</span>{' '}
                      <span className="text-amber-400 font-bold">
                        {rule.condition === 'GREATER_THAN' ? '≥' : '≤'}
                      </span>{' '}
                      <span className="text-indigo-300 font-bold">{rule.threshold}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 border border-slate-700 text-slate-300">
                        {rule.channel === 'WEBHOOK' ? '🟣 Discord' : '🔵 Telegram'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {cooldownActive ? (
                        <span className="text-amber-400 flex items-center gap-1">
                          ⏳ Cooldown Active
                        </span>
                      ) : rule.lastTriggeredAt ? (
                        <span className="text-slate-400">
                          Last: {new Date(rule.lastTriggeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      ) : (
                        <span className="text-slate-500">Standby (Never fired)</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggle(rule)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                          rule.isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {rule.isActive ? '● Active' : '○ Paused'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(rule._id)}
                        className="text-slate-500 hover:text-rose-400 transition font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <CreateRuleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleCreate}
      />
    </div>
  );
};