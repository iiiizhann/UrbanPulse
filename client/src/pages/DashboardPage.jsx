import React, { useState, useEffect, useRef } from 'react';
import { analyticsApi } from '../services/api';
import { Navbar } from '../components/layout/Navbar';
import { StatCard } from '../components/dashboard/StatCard';
import { TrendChart } from '../components/charts/TrendChart';
import { CityMap } from '../components/dashboard/CityMap';
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
        text: 'text-emerald-600',
        stroke: '#10b981',
        bg: 'bg-emerald-500/15',
        border: 'border-emerald-500/30',
        glow: 'rgba(16, 185, 129, 0.35)',
        status: 'Good',
        description: 'Air quality is pristine. Ideal for all outdoor recreational activities.',
      };
    }
    if (aqi <= 100) {
      return {
        text: 'text-amber-600',
        stroke: '#f59e0b',
        bg: 'bg-amber-500/15',
        border: 'border-amber-500/30',
        glow: 'rgba(245, 158, 11, 0.35)',
        status: 'Moderate',
        description: 'Acceptable; sensitive individuals might experience slight irritation.',
      };
    }
    if (aqi <= 200) {
      return {
        text: 'text-orange-600',
        stroke: '#f97316',
        bg: 'bg-orange-500/15',
        border: 'border-orange-500/30',
        glow: 'rgba(249, 115, 22, 0.35)',
        status: 'Unhealthy',
        description: 'Increased likelihood of respiratory discomfort across population.',
      };
    }
    if (aqi <= 300) {
      return {
        text: 'text-rose-600',
        stroke: '#e11d48',
        bg: 'bg-rose-500/15',
        border: 'border-rose-500/30',
        glow: 'rgba(225, 29, 72, 0.35)',
        status: 'Very Unhealthy',
        description: 'Health alert: high risk of respiratory irritation in public.',
      };
    }
    return {
      text: 'text-purple-600',
      stroke: '#9333ea',
      bg: 'bg-purple-500/15',
      border: 'border-purple-500/30',
      glow: 'rgba(147, 51, 234, 0.4)',
      status: 'Hazardous',
      description: 'Emergency conditions: severe health warning; minimize outdoor activity.',
    };
  };

  const aqiVal = snapshot?.airQuality?.aqi ?? 0;
  const aqiTheme = getAqiTheme(aqiVal);

  const arcRadius = 75;
  const arcCircumference = Math.PI * arcRadius;
  const clampedScale = Math.min(Math.max(aqiVal, 0), 500);
  const strokeOffset = arcCircumference * (1 - clampedScale / 500);

  return (
    <div className="min-h-screen bg-[#f3f5f8] relative overflow-hidden text-slate-800">
      {/* Ambient Liquid Color Orbs behind the frosted glass */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-teal-300/40 rounded-full blur-[110px] pointer-events-none" />
      <div className="fixed top-1/3 -right-40 w-96 h-96 bg-sky-300/35 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed -bottom-40 left-1/3 w-96 h-96 bg-indigo-200/40 rounded-full blur-[110px] pointer-events-none" />

      <Navbar selectedCity={selectedCity} onSelectCity={setSelectedCity} cities={cities} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 relative z-10">
        {/* Header Glass Capsule */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-black tracking-tight text-slate-900">
                {selectedCity}
              </h1>
              <span className="text-lg font-light text-slate-400">/</span>
              <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">
                Metropolitan Node
              </span>

              {/* Apple-Style Live Badge */}
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold apple-capsule text-teal-800 border-white">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
                </span>
                <span className="font-mono text-[11px] font-bold">LIVE PULSE</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Autonomous ingestion, Zod schema validation & SHA-256 deduplication telemetry.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {trends.length > 0 && (
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center space-x-2 text-xs font-semibold px-4 py-2 rounded-2xl apple-capsule hover:bg-white text-slate-700 transition-all active:scale-95"
              >
                <Download className="h-3.5 w-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>
            )}

            <div className="text-xs text-slate-600 apple-capsule px-4 py-2 rounded-2xl flex items-center space-x-2">
              <Radio className={`h-3.5 w-3.5 ${isSyncing ? 'text-teal-600 animate-spin' : 'text-slate-400'}`} />
              <span>
                Synced:{' '}
                <strong className="font-mono font-semibold text-slate-800">
                  {lastPolled.toLocaleTimeString()}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="h-72 flex flex-col items-center justify-center space-y-3 apple-glass rounded-3xl">
            <div className="h-8 w-8 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
            <p className="text-xs font-medium text-slate-500">Querying real-time city snapshot...</p>
          </div>
        ) : snapshot ? (
          <>
            {/* Top Interactive Zone: Gauge + Weather KPI Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Apple Glass Dynamic Radial AQI Visualizer (5 Cols) */}
              <div className="lg:col-span-5 apple-glass rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden">
                {/* Dynamic Specular Orb inside Card */}
                <div
                  className="absolute -top-16 -right-16 w-52 h-52 rounded-full blur-3xl pointer-events-none transition-colors duration-700"
                  style={{ backgroundColor: aqiTheme.glow }}
                />

                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-slate-500" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Air Quality Index
                      </span>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border tracking-wide uppercase backdrop-blur-md transition-all duration-500 ${aqiTheme.bg} ${aqiTheme.text} ${aqiTheme.border}`}
                    >
                      {snapshot.airQuality.status}
                    </span>
                  </div>

                  {/* SVG Arc Display */}
                  <div className="relative flex flex-col items-center justify-center pt-5 pb-2">
                    <svg width="220" height="125" viewBox="0 0 220 125" className="overflow-visible">
                      <path
                        d="M 25 115 A 75 75 0 0 1 195 115"
                        fill="none"
                        stroke="rgba(0, 0, 0, 0.06)"
                        strokeWidth="16"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 25 115 A 75 75 0 0 1 195 115"
                        fill="none"
                        stroke={aqiTheme.stroke}
                        strokeWidth="16"
                        strokeLinecap="round"
                        strokeDasharray={arcCircumference}
                        strokeDashoffset={strokeOffset}
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>

                    <div className="absolute bottom-1 flex flex-col items-center">
                      <div className="flex items-baseline space-x-1">
                        <span className={`text-5xl font-black font-mono tracking-tighter ${aqiTheme.text}`}>
                          {snapshot.airQuality.aqi}
                        </span>
                        <span className="text-xs font-bold uppercase text-slate-400">AQI</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                        Scale 0 &ndash; 500
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 text-center mt-2 px-6 leading-relaxed">
                    {aqiTheme.description}
                  </p>
                </div>

                {/* Micro Pollutant Glass Chips */}
                <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-slate-200/50">
                  <div className="apple-capsule rounded-2xl p-3">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase">
                      <span>PM2.5</span>
                      <span className="text-[10px] text-teal-600 font-mono">Fine Dust</span>
                    </div>
                    <div className="text-lg font-black font-mono text-slate-800 mt-0.5">
                      {snapshot.airQuality.pm25 !== null && snapshot.airQuality.pm25 !== undefined
                        ? `${snapshot.airQuality.pm25} µg/m³`
                        : 'N/A'}
                    </div>
                  </div>

                  <div className="apple-capsule rounded-2xl p-3">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase">
                      <span>PM10</span>
                      <span className="text-[10px] text-sky-600 font-mono">Coarse</span>
                    </div>
                    <div className="text-lg font-black font-mono text-slate-800 mt-0.5">
                      {snapshot.airQuality.pm10 !== null && snapshot.airQuality.pm10 !== undefined
                        ? `${snapshot.airQuality.pm10} µg/m³`
                        : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Weather & Civic Matrix (7 Cols) */}
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
                    title="Humidity"
                    value={snapshot.weather.humidity}
                    unit="%"
                    icon={Droplets}
                    color="bg-blue-600"
                    subtitle={`Wind: ${snapshot.weather.windSpeed} m/s`}
                  />
                  <StatCard
                    title="Petrol Benchmark"
                    value={`₹${snapshot.fuel.petrolPrice}`}
                    icon={Fuel}
                    color="bg-amber-600"
                    subtitle={`Diesel: ₹${snapshot.fuel.dieselPrice}`}
                  />
                </div>

                {/* Dark Glass Deep-Frosted Banner */}
                <div className="apple-glass-dark text-white rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between flex-1">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative space-y-2">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-4 w-4 text-teal-400" />
                      <span className="text-xs font-bold tracking-wider uppercase text-teal-400 font-mono">
                        Telemetry Engine
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-100">
                      High-Cadence Ingestion Cycle Verified
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                      Telemetry for <strong className="text-white">{selectedCity}</strong> was
                      transformed via SI-unit normalization, validated by Zod, and deduplicated using
                      cryptographic SHA-256 fingerprinting.
                    </p>
                  </div>

                  <div className="relative mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span className="text-slate-400">Content Hash:</span>
                      <span className="font-mono text-[11px] bg-white/10 text-slate-200 px-2.5 py-1 rounded-xl border border-white/10 truncate max-w-[190px]">
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

            {/* Visual Analytics & Map Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 apple-glass rounded-3xl p-5">
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
                        ? 'High pollutant concentration detected. Sensitive groups should wear N95 respirators and limit prolonged outdoor exposure.'
                        : 'Atmospheric safety parameters remain within tolerable standards for typical outdoor civic routines.'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/50 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Target Stations: OpenWeather / WAQI</span>
                    <span className="font-mono text-slate-600">GeoPoint Verified</span>
                  </div>
                </div>
              </div>
            </div>
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