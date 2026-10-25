import React, { useState, useEffect, useRef } from 'react';
import { analyticsApi } from '../services/api';
import { Navbar } from '../components/layout/Navbar';
import { StatCard } from '../components/dashboard/StatCard';
import { TrendChart } from '../components/charts/TrendChart';
import { CityMap } from '../components/dashboard/CityMap';
import { AlertManager } from '../components/alerts/AlertManager';
import {
  Thermometer,
  Droplets,
  Fuel,
  Download,
  Radio,
  Activity,
  Layers,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';

export const DashboardPage = () => {
  const [selectedCity, setSelectedCity] = useState('Pune');
  const [snapshot, setSnapshot] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastPolled, setLastPolled] = useState(new Date());
  const [isSyncing, setIsSyncing] = useState(false);

  const cities = ['Pune', 'Mumbai', 'Delhi'];
  const pollingRef = useRef(null);

  const fetchCityData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsSyncing(true);

    try {
      const [snapRes, trendRes] = await Promise.all([
        analyticsApi.getLatest(selectedCity),
        analyticsApi.getTrends(selectedCity, 24),
      ]);
      setSnapshot(snapRes.data.data);
      setTrends(trendRes.data.data);
      setLastPolled(new Date());
    } catch (err) {
      console.error('Failed to load city metrics:', err);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchCityData(false);

    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(() => {
      fetchCityData(true);
    }, 15000);

    return () => clearInterval(pollingRef.current);
  }, [selectedCity]);

  const handleExportCSV = () => {
    if (!trends || trends.length === 0) return;

    const headers = ['Timestamp', 'Avg AQI', 'Max AQI', 'Avg Temp (°C)', 'Avg Humidity (%)', 'Avg PM2.5 (µg/m³)'];
    const rows = trends.map((t) => [
      t.timestamp,
      t.avgAqi,
      t.maxAqi,
      t.avgTemperature,
      t.avgHumidity,
      t.avgPm25 ?? 'N/A',
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedCity}_telemetry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getAqiTheme = (aqi = 0) => {
    if (aqi <= 50) {
      return {
        text: 'text-emerald-500',
        stroke: '#10b981',
        bg: 'bg-emerald-500/15',
        border: 'border-emerald-500/30',
        glow: 'rgba(16, 185, 129, 0.4)',
        status: 'Good',
        desc: 'Air quality is pristine. Zero civic risk detected across municipal sectors.',
      };
    }
    if (aqi <= 100) {
      return {
        text: 'text-amber-500',
        stroke: '#f59e0b',
        bg: 'bg-amber-500/15',
        border: 'border-amber-500/30',
        glow: 'rgba(245, 158, 11, 0.4)',
        status: 'Moderate',
        desc: 'Atmospheric conditions acceptable. Minor irritants for sensitive individuals.',
      };
    }
    if (aqi <= 200) {
      return {
        text: 'text-orange-500',
        stroke: '#f97316',
        bg: 'bg-orange-500/15',
        border: 'border-orange-500/30',
        glow: 'rgba(249, 115, 22, 0.45)',
        status: 'Unhealthy',
        desc: 'Noticeable particulate elevation. Outdoor physical exertion should be reduced.',
      };
    }
    if (aqi <= 300) {
      return {
        text: 'text-rose-500',
        stroke: '#e11d48',
        bg: 'bg-rose-500/15',
        border: 'border-rose-500/30',
        glow: 'rgba(225, 29, 72, 0.45)',
        status: 'Very Unhealthy',
        desc: 'Health alert: high respiratory irritation risk across all demographic groups.',
      };
    }
    return {
      text: 'text-purple-500',
      stroke: '#9333ea',
      bg: 'bg-purple-500/15',
      border: 'border-purple-500/30',
      glow: 'rgba(147, 51, 234, 0.5)',
      status: 'Hazardous',
      desc: 'Emergency condition: civic warnings active; minimize all outside activities.',
    };
  };

  const aqiVal = snapshot?.airQuality?.aqi ?? 0;
  const aqiTheme = getAqiTheme(aqiVal);

  const arcRadius = 78;
  const arcCircumference = Math.PI * arcRadius;
  const clampedScale = Math.min(Math.max(aqiVal, 0), 500);
  const strokeOffset = arcCircumference * (1 - clampedScale / 500);

  return (
    <div className="min-h-screen bg-[#edf2f7] relative overflow-hidden text-slate-800">
      {/* Dynamic Animated Liquid Glass Orbs */}
      <div className="fixed -top-48 -left-48 w-[550px] h-[550px] bg-gradient-to-tr from-teal-300/45 to-emerald-200/40 rounded-full blur-[130px] pointer-events-none animate-float-slow" />
      <div className="fixed top-1/4 -right-48 w-[600px] h-[600px] bg-gradient-to-br from-sky-300/40 to-blue-300/30 rounded-full blur-[140px] pointer-events-none animate-float-reverse" />
      <div className="fixed -bottom-48 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-300/35 to-purple-200/30 rounded-full blur-[120px] pointer-events-none animate-float-slow" />

      <Navbar selectedCity={selectedCity} onSelectCity={setSelectedCity} cities={cities} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 relative z-10">
        {/* Floating Capsule Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-black tracking-tight text-slate-900 drop-shadow-xs">
                {selectedCity}
              </h1>
              <span className="text-xl font-light text-slate-400">/</span>
              <span className="text-xs font-extrabold text-slate-500 tracking-wider uppercase">
                Metropolitan Node
              </span>

              {/* Pulsing Neon Live Badge */}
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold apple-capsule text-teal-800 transition-all hover:scale-105 cursor-default">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-80" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
                </span>
                <span className="font-mono text-[11px] font-bold tracking-wider">LIVE TELEMETRY</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Real-time environmental ingestion, Zod schema validation & SHA-256 state tracking.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {trends.length > 0 && (
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center space-x-2 text-xs font-semibold px-4 py-2.5 rounded-2xl apple-capsule hover:bg-white text-slate-700 transition-all active:scale-95 hover:shadow-md"
              >
                <Download className="h-3.5 w-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>
            )}

            <div className="text-xs text-slate-600 apple-capsule px-4 py-2.5 rounded-2xl flex items-center space-x-2">
              <Radio className={`h-3.5 w-3.5 ${isSyncing ? 'text-teal-600 animate-spin' : 'text-slate-400'}`} />
              <span>
                Synced:{' '}
                <strong className="font-mono font-bold text-slate-800">
                  {lastPolled.toLocaleTimeString()}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="h-80 flex flex-col items-center justify-center space-y-4 apple-glass rounded-3xl">
            <div className="relative">
              <div className="h-10 w-10 rounded-full border-3 border-teal-500/30 border-t-teal-600 animate-spin" />
              <Sparkles className="h-4 w-4 text-teal-600 absolute inset-0 m-auto" />
            </div>
            <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
              Streaming live atmospheric snapshots...
            </p>
          </div>
        ) : snapshot ? (
          <>
            {/* Top Interactive Zone: Radial Visualizer & Weather Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Apple Glass Dynamic AQI Arc Visualizer (5 cols) */}
              <div className="lg:col-span-5 apple-glass rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group">
                {/* Dynamic Specular Orb inside Card */}
                <div
                  className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl pointer-events-none transition-all duration-1000 ease-out group-hover:scale-125"
                  style={{ backgroundColor: aqiTheme.glow }}
                />

                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-slate-500" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                        Air Quality Index
                      </span>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-extrabold border tracking-wider uppercase backdrop-blur-md transition-all duration-700 ${aqiTheme.bg} ${aqiTheme.text} ${aqiTheme.border}`}
                    >
                      {snapshot.airQuality.status}
                    </span>
                  </div>

                  {/* SVG Arc Display with Smooth Render */}
                  <div className="relative flex flex-col items-center justify-center pt-6 pb-2">
                    <svg width="230" height="130" viewBox="0 0 230 130" className="overflow-visible">
                      <path
                        d="M 25 120 A 78 78 0 0 1 205 120"
                        fill="none"
                        stroke="rgba(0, 0, 0, 0.05)"
                        strokeWidth="18"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 25 120 A 78 78 0 0 1 205 120"
                        fill="none"
                        stroke={aqiTheme.stroke}
                        strokeWidth="18"
                        strokeLinecap="round"
                        strokeDasharray={arcCircumference}
                        strokeDashoffset={strokeOffset}
                        className="transition-all duration-1000 ease-out"
                        style={{ filter: `drop-shadow(0 0 10px ${aqiTheme.stroke}88)` }}
                      />
                    </svg>

                    <div className="absolute bottom-1 flex flex-col items-center">
                      <div className="flex items-baseline space-x-1">
                        <span className={`text-6xl font-black font-mono tracking-tighter ${aqiTheme.text} transition-colors duration-700`}>
                          {snapshot.airQuality.aqi}
                        </span>
                        <span className="text-xs font-extrabold uppercase text-slate-400">AQI</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">
                        Scale 0 &ndash; 500
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 text-center mt-3 px-6 leading-relaxed">
                    {aqiTheme.desc}
                  </p>
                </div>

                {/* Micro Pollutant Glass Chips */}
                <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-slate-200/50 relative z-10">
                  <div className="apple-capsule rounded-2xl p-3.5 transition-transform hover:-translate-y-0.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase">
                      <span>PM2.5</span>
                      <span className="text-[10px] text-teal-600 font-mono">Fine</span>
                    </div>
                    <div className="text-lg font-black font-mono text-slate-800 mt-1">
                      {snapshot.airQuality.pm25 !== null && snapshot.airQuality.pm25 !== undefined
                        ? `${snapshot.airQuality.pm25} µg/m³`
                        : 'N/A'}
                    </div>
                  </div>

                  <div className="apple-capsule rounded-2xl p-3.5 transition-transform hover:-translate-y-0.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase">
                      <span>PM10</span>
                      <span className="text-[10px] text-sky-600 font-mono">Coarse</span>
                    </div>
                    <div className="text-lg font-black font-mono text-slate-800 mt-1">
                      {snapshot.airQuality.pm10 !== null && snapshot.airQuality.pm10 !== undefined
                        ? `${snapshot.airQuality.pm10} µg/m³`
                        : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Weather & Civic Matrix (7 cols) */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <StatCard
                    title="Ambient Temp"
                    value={snapshot.weather.temperature}
                    unit="°C"
                    icon={Thermometer}
                    color="bg-sky-500"
                    subtitle={`Feels: ${snapshot.weather.feelsLike}°C • ${snapshot.weather.condition}`}
                  />
                  <StatCard
                    title="Relative Humidity"
                    value={snapshot.weather.humidity}
                    unit="%"
                    icon={Droplets}
                    color="bg-blue-600"
                    subtitle={`Wind speed: ${snapshot.weather.windSpeed} m/s`}
                  />
                  <StatCard
                    title="Petrol Benchmark"
                    value={`₹${snapshot.fuel.petrolPrice}`}
                    icon={Fuel}
                    color="bg-amber-600"
                    subtitle={`Diesel: ₹${snapshot.fuel.dieselPrice}`}
                  />
                </div>

                {/* Apple Glass Dark Console Banner */}
                <div className="apple-glass-dark text-white rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between flex-1 group">
                  <div className="absolute top-0 right-0 w-72 h-72 bg-teal-400/15 rounded-full blur-3xl pointer-events-none group-hover:bg-teal-400/25 transition-all duration-700" />

                  <div className="relative space-y-2">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-4 w-4 text-teal-400 animate-pulse" />
                      <span className="text-xs font-bold tracking-wider uppercase text-teal-400 font-mono">
                        ETL Engine Snapshot
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                      <span>High-Cadence Ingestion Cycle Verified</span>
                      <ArrowUpRight className="h-4 w-4 text-slate-400" />
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                      Telemetry for <strong className="text-white">{selectedCity}</strong> was
                      transformed via SI-unit normalization, validated with Zod, and cryptographically
                      fingerprinted using SHA-256 for deterministic caching.
                    </p>
                  </div>

                  <div className="relative mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span className="text-slate-400">Content Hash:</span>
                      <span className="font-mono text-[11px] bg-white/10 text-teal-200 px-3 py-1 rounded-xl border border-white/10 truncate max-w-[210px]">
                        {snapshot.contentHash}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 text-slate-400 text-[11px]">
                      <Layers className="h-3.5 w-3.5 text-teal-400" />
                      <span>Collection: <strong className="text-slate-200">citymetrics</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Analytics & Map Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 apple-glass rounded-3xl p-6">
                <TrendChart trends={trends} city={selectedCity} />
              </div>

              <div className="space-y-6">
                <div className="apple-glass rounded-3xl overflow-hidden p-2">
                  <CityMap
                    selectedCity={selectedCity}
                    onSelectCity={setSelectedCity}
                    snapshot={snapshot}
                  />
                </div>

                <div className="apple-glass rounded-3xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-2 text-slate-900 font-bold mb-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <span className="text-sm">Civic Advisory Guidance</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Current air quality in {selectedCity} is rated{' '}
                      <strong className="text-slate-900">{snapshot.airQuality.status}</strong> (Index {snapshot.airQuality.aqi}).{' '}
                      {snapshot.airQuality.aqi > 200
                        ? 'High atmospheric pollutant concentration detected. Sensitive groups should wear N95 respirators.'
                        : 'Atmospheric conditions remain within tolerable standards for typical outdoor civic routines.'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/50 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Target Stations: OpenWeather / WAQI</span>
                    <span className="font-mono text-slate-600">GeoPoint Verified</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Threshold Alert Manager Section */}
            <AlertManager currentCity={selectedCity} />
          </>
        ) : (
          <div className="text-center py-16 apple-glass rounded-3xl text-slate-500">
            No telemetry records found for this location. Run an ingestion cycle from the admin console.
          </div>
        )}
      </main>
    </div>
  );
};