import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  Wind, 
  Thermometer, 
  ChevronRight, 
  Sparkles, 
  Send,
  AlertCircle 
} from 'lucide-react';

const CITIES = ['Pune', 'Mumbai', 'Delhi'];

export const CreateRuleModal = ({ isOpen, onClose, onCreated, defaultCity = 'Pune' }) => {
  const [city, setCity] = useState(defaultCity);
  const [metric, setMetric] = useState('AQI');
  const [condition, setCondition] = useState('GREATER_THAN');
  const [threshold, setThreshold] = useState(100);
  const [channel, setChannel] = useState('WEBHOOK');
  const [destination, setDestination] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!destination.trim()) {
      setError('Please provide a Discord Webhook URL or Telegram ID');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onCreated({
        city,
        metric,
        condition,
        threshold: Number(threshold),
        channel,
        destination: destination.trim(),
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create alert');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectMetric = (selected) => {
    setMetric(selected);
    if (selected === 'AQI' && threshold < 30) setThreshold(100);
    if (selected === 'TEMPERATURE' && threshold > 60) setThreshold(35);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-lg my-auto rounded-3xl bg-white border border-slate-100 shadow-2xl p-6 text-slate-800 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Create Air & Weather Alert</h3>
              <p className="text-xs text-slate-500">Get automatic alerts when city conditions change</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* 1. City */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              1. Which City?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CITIES.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setCity(c)}
                  className={`py-2 px-3 rounded-2xl text-xs font-bold transition-all border ${
                    city === c
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Metric */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              2. What do you want to track?
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleSelectMetric('AQI')}
                className={`flex items-center space-x-2.5 p-2.5 rounded-2xl border transition-all text-left ${
                  metric === 'AQI'
                    ? 'bg-teal-50/70 border-teal-500 text-teal-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Wind className={`h-4 w-4 ${metric === 'AQI' ? 'text-teal-600' : 'text-slate-400'}`} />
                <div>
                  <div className="text-xs font-bold">Air Quality (AQI)</div>
                  <div className="text-[10px] text-slate-500">Pollution levels</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectMetric('TEMPERATURE')}
                className={`flex items-center space-x-2.5 p-2.5 rounded-2xl border transition-all text-left ${
                  metric === 'TEMPERATURE'
                    ? 'bg-amber-50/70 border-amber-500 text-amber-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Thermometer className={`h-4 w-4 ${metric === 'TEMPERATURE' ? 'text-amber-600' : 'text-slate-400'}`} />
                <div>
                  <div className="text-xs font-bold">Temperature</div>
                  <div className="text-[10px] text-slate-500">Hot or cold spikes</div>
                </div>
              </button>
            </div>
          </div>

          {/* 3. Condition */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              3. When should it alert you?
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full h-10 rounded-2xl bg-slate-50 border border-slate-200 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="GREATER_THAN">Rises above (≥)</option>
                <option value="LESS_THAN">Drops below (≤)</option>
              </select>

              <div className="relative">
                <input
                  type="number"
                  required
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  className="w-full h-10 rounded-2xl bg-slate-50 border border-slate-200 px-3 pr-10 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
                <span className="absolute right-3 top-2.5 text-[10px] font-bold text-slate-400">
                  {metric === 'AQI' ? 'AQI' : '°C'}
                </span>
              </div>
            </div>
          </div>

          {/* 4. Channel & Destination */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                4. Where should we send it?
              </label>
              <div className="flex items-center space-x-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setChannel('WEBHOOK')}
                  className={`px-2 py-0.5 rounded-lg font-bold transition ${
                    channel === 'WEBHOOK'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Discord
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => setChannel('TELEGRAM')}
                  className={`px-2 py-0.5 rounded-lg font-bold transition ${
                    channel === 'TELEGRAM'
                      ? 'bg-sky-100 text-sky-700'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Telegram
                </button>
              </div>
            </div>

            <div className="relative">
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full h-10 rounded-2xl bg-slate-50 border border-slate-200 px-3 pl-8 text-xs font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                placeholder={
                  channel === 'WEBHOOK'
                    ? 'Paste your Discord Webhook URL...'
                    : 'Enter Telegram Chat ID...'
                }
              />
              <Send className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-3" />
            </div>
          </div>

          {/* Live Explanation Pill */}
          <div className="rounded-2xl bg-teal-50/70 border border-teal-200/60 p-2.5 flex items-start space-x-2">
            <Sparkles className="h-3.5 w-3.5 text-teal-600 shrink-0 mt-0.5" />
            <div className="text-[11px] text-teal-900 leading-relaxed">
              <span className="font-bold">Summary: </span>
              Alert on <strong className="underline">{channel === 'WEBHOOK' ? 'Discord' : 'Telegram'}</strong> when{' '}
              <strong className="underline">{city}</strong>'s{' '}
              <strong className="underline">{metric === 'AQI' ? 'AQI' : 'Temperature'}</strong>{' '}
              {condition === 'GREATER_THAN' ? 'reaches or exceeds' : 'drops to or below'}{' '}
              <strong className="font-mono font-bold bg-white px-1 py-0.5 rounded border border-teal-200">{threshold} {metric === 'AQI' ? 'AQI' : '°C'}</strong>.
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center space-x-2 px-5 py-2 text-xs font-bold rounded-2xl bg-slate-900 text-white hover:bg-slate-800 active:scale-95 transition shadow-sm disabled:opacity-50"
            >
              <span>{submitting ? 'Saving...' : 'Turn On Alert'}</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};