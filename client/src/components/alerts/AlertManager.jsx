import React, { useEffect, useState } from 'react';
import { alertService } from '../../services/alert.service';
import { CreateRuleModal } from './CreateRuleModal';
import {
  BellRing,
  Plus,
  Trash2,
  Power,
  ShieldCheck,
  Send,
  Zap,
} from 'lucide-react';

export const AlertManager = ({ currentCity }) => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [notice, setNotice] = useState(null);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const data = await alertService.getRules();
      setRules(data);
    } catch (err) {
      flashNotice(err.message || 'Failed to fetch alert rules', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const flashNotice = (msg, type = 'success') => {
    setNotice({ msg, type });
    setTimeout(() => setNotice(null), 3500);
  };

  const handleCreate = async (payload) => {
    await alertService.createRule(payload);
    flashNotice(`Alert activated for ${payload.city}!`);
    fetchRules();
  };

  const handleToggle = async (rule) => {
    try {
      const updated = await alertService.toggleRule(rule._id, !rule.isActive);
      setRules((prev) => prev.map((r) => (r._id === rule._id ? { ...r, isActive: updated.isActive } : r)));
      flashNotice(`Rule for ${rule.city} ${updated.isActive ? 'resumed' : 'paused'}.`);
    } catch (err) {
      flashNotice(err.message, 'error');
    }
  };

  const handleDelete = async (id, city) => {
    if (!window.confirm(`Delete alert rule for ${city}?`)) return;
    try {
      await alertService.deleteRule(id);
      setRules((prev) => prev.filter((r) => r._id !== id));
      flashNotice(`Rule deleted.`, 'info');
    } catch (err) {
      flashNotice(err.message, 'error');
    }
  };

  return (
    <div className="apple-glass rounded-3xl p-6 relative overflow-hidden space-y-4">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/60">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-teal-500/15 text-teal-700">
              <BellRing className="h-4 w-4" />
            </div>
            <h2 className="text-base font-extrabold tracking-tight text-slate-900">
              Civic Alert Dispatcher
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated threshold triggers delivering instant alerts to Discord and Telegram.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center space-x-2 text-xs font-bold px-4 py-2.5 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 transition active:scale-95 shadow-sm"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Alert Rule</span>
        </button>
      </div>

      {notice && (
        <div
          className={`p-3 rounded-2xl text-xs font-semibold border flex items-center gap-2 ${
            notice.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-700'
              : 'bg-teal-50 border-teal-200 text-teal-700'
          }`}
        >
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span>{notice.msg}</span>
        </div>
      )}

      {loading ? (
        <div className="py-8 text-center text-xs font-semibold text-slate-400 animate-pulse">
          Loading active rules...
        </div>
      ) : rules.length === 0 ? (
        <div className="py-8 text-center text-xs font-medium text-slate-400">
          No alert rules yet. Click <strong className="text-slate-700 font-bold">New Alert Rule</strong> to set your first alert.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="pb-3 px-3">City</th>
                <th className="pb-3 px-3">Threshold Condition</th>
                <th className="pb-3 px-3">Channel</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3">State</th>
                <th className="pb-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {rules.map((rule) => {
                const isCurrent = rule.city.toLowerCase() === currentCity.toLowerCase();

                return (
                  <tr
                    key={rule._id}
                    className={`transition-colors ${
                      isCurrent ? 'bg-teal-500/5' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <td className="py-3.5 px-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900">{rule.city}</span>
                        {isCurrent && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-extrabold uppercase">
                            Current
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="inline-flex items-center space-x-1.5 font-mono text-xs">
                        <span className="font-bold text-slate-700">{rule.metric}</span>
                        <span className="text-amber-500 font-black">
                          {rule.condition === 'GREATER_THAN' ? '≥' : '≤'}
                        </span>
                        <span className="font-black text-slate-900 px-2 py-0.5 rounded-lg bg-white/80 border border-slate-200">
                          {rule.threshold} {rule.metric === 'TEMPERATURE' ? '°C' : ''}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold apple-capsule text-slate-700">
                        <Send className="h-3 w-3 text-indigo-500" />
                        <span>{rule.channel === 'WEBHOOK' ? 'Discord' : 'Telegram'}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      {!rule.isActive ? (
                        <span className="text-[11px] text-slate-400 font-medium">Inactive</span>
                      ) : rule.lastTriggeredAt ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-teal-500/15 text-teal-700 border border-teal-500/30">
                          <Zap className="h-3 w-3 text-teal-600" />
                          <span>
                            Triggered {new Date(rule.lastTriggeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">Armed (Instant)</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3">
                      <button
                        onClick={() => handleToggle(rule)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                          rule.isActive
                            ? 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 hover:bg-emerald-500/25'
                            : 'bg-slate-200/60 text-slate-500 border border-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        <Power className="h-3 w-3" />
                        <span>{rule.isActive ? 'Active' : 'Paused'}</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => handleDelete(rule._id, rule.city)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete rule"
                      >
                        <Trash2 className="h-4 w-4" />
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
        defaultCity={currentCity}
      />
    </div>
  );
};