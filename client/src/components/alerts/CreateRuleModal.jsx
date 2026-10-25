import React, { useState } from 'react';
import { BellRing, X, AlertTriangle, ShieldAlert } from 'lucide-react';

const CITIES = ['Pune', 'Mumbai', 'Delhi'];
const METRICS = [
  { label: 'Air Quality Index (AQI)', value: 'AQI' },
  { label: 'Ambient Temperature (°C)', value: 'TEMPERATURE' },
];
const CONDITIONS = [
  { label: 'Exceeds or Equals (≥)', value: 'GREATER_THAN' },
  { label: 'Falls Below or Equals (≤)', value: 'LESS_THAN' },
];
const CHANNELS = [
  { label: 'Discord / Webhook', value: 'WEBHOOK' },
  { label: 'Telegram Bot', value: 'TELEGRAM' },
];

export const CreateRuleModal = ({ isOpen, onClose, onCreated, defaultCity = 'Pune' }) => {
  const [formData, setFormData] = useState({
    city: defaultCity,
    metric: 'AQI',
    condition: 'GREATER_THAN',
    threshold: 100,
    channel: 'WEBHOOK',
    destination: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await onCreated({
        ...formData,
        threshold: Number(formData.threshold),
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to register alert rule');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-md p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white/85 border border-white/60 p-6 shadow-2xl backdrop-blur-xl text-slate-800 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-4 mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-700">
              <BellRing className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">New Telemetry Alert Rule</h3>
              <p className="text-[11px] text-slate-500">Autonomous notifications when sensors breach safe civic limits</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl bg-rose-50 border border-rose-200/80 p-3 text-xs text-rose-700 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Target Node</label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full rounded-2xl bg-slate-100/80 border border-slate-200 px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Metric Key</label>
              <select
                value={formData.metric}
                onChange={(e) => setFormData({ ...formData, metric: e.target.value })}
                className="w-full rounded-2xl bg-slate-100/80 border border-slate-200 px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              >
                {METRICS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Condition Trigger</label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="w-full rounded-2xl bg-slate-100/80 border border-slate-200 px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              >
                {CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Threshold Limit</label>
              <input
                type="number"
                required
                value={formData.threshold}
                onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                className="w-full rounded-2xl bg-slate-100/80 border border-slate-200 px-3.5 py-2.5 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                placeholder="e.g. 100"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Dispatch Protocol</label>
            <select
              value={formData.channel}
              onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
              className="w-full rounded-2xl bg-slate-100/80 border border-slate-200 px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            >
              {CHANNELS.map((ch) => (
                <option key={ch.value} value={ch.value}>{ch.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Destination Webhook URL or Chat ID
            </label>
            <input
              type="text"
              required
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              className="w-full rounded-2xl bg-slate-100/80 border border-slate-200 px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              placeholder={
                formData.channel === 'WEBHOOK'
                  ? 'https://discord.com/api/webhooks/...'
                  : '@telegram_channel_or_chat_id'
              }
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold rounded-2xl text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 text-xs font-bold rounded-2xl bg-slate-900 text-white hover:bg-slate-800 transition shadow-md shadow-slate-900/10 disabled:opacity-50"
            >
              {submitting ? 'Registering...' : 'Deploy Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};