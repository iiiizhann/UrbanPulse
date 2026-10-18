import React, { useState, useEffect, useRef } from 'react';
import { analyticsApi } from '../services/api';
import { Navbar } from '../components/layout/Navbar';
import { StatCard } from '../components/dashboard/StatCard';
import { TrendChart } from '../components/charts/TrendChart';
import { CityMap } from '../components/dashboard/CityMap';
import { Wind, Thermometer, Droplets, Fuel, AlertTriangle, Download, Radio } from 'lucide-react';

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

  // Initial fetch on city switch
  useEffect(() => {
    fetchCityData(false);

    // Auto-polling cycle every 15 seconds
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

  const getAqiColor = (status) => {
    switch (status) {
      case 'Good':
        return 'bg-emerald-500';
      case 'Moderate':
        return 'bg-amber-500';
      case 'Unhealthy':
      case 'Very Unhealthy':
      case 'Hazardous':
        return 'bg-rose-500';
      default:
        return 'bg-slate-500';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
        cities={cities}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-slate-900">
                {selectedCity} City Dashboard
              </h1>
              {/* Live Pulse Indicator */}
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Live Pulse</span>
              </div>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Real-time municipal telemetry aggregated via UrbanPulse ETL workers.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {trends.length > 0 && (
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm transition-colors"
                title="Download historical trend dataset"
              >
                <Download className="h-3.5 w-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>
            )}

            <div className="text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm flex items-center space-x-2">
              <Radio className={`h-3 w-3 ${isSyncing ? 'text-teal-600 animate-spin' : 'text-slate-400'}`} />
              <span>
                Synced:{' '}
                <strong className="text-slate-700">
                  {lastPolled.toLocaleTimeString()}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center text-slate-400">
            Ingesting latest pipeline telemetry...
          </div>
        ) : snapshot ? (
          <>
            {/* KPI Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Air Quality"
                value={snapshot.airQuality.aqi}
                unit="AQI"
                icon={Wind}
                color={getAqiColor(snapshot.airQuality.status)}
                badge={snapshot.airQuality.status}
                subtitle={`PM2.5: ${snapshot.airQuality.pm25 ?? 'N/A'} µg/m³`}
              />
              <StatCard
                title="Temperature"
                value={snapshot.weather.temperature}
                unit="°C"
                icon={Thermometer}
                color="bg-sky-500"
                subtitle={`Feels like ${snapshot.weather.feelsLike}°C • ${snapshot.weather.condition}`}
              />
              <StatCard
                title="Humidity"
                value={snapshot.weather.humidity}
                unit="%"
                icon={Droplets}
                color="bg-blue-600"
                subtitle={`Wind speed: ${snapshot.weather.windSpeed} m/s`}
              />
              <StatCard
                title="Petrol Price"
                value={`₹${snapshot.fuel.petrolPrice}`}
                icon={Fuel}
                color="bg-amber-600"
                subtitle={`Diesel: ₹${snapshot.fuel.dieselPrice}`}
              />
            </div>

            {/* Visual Analytics, Map, and Alert Widget */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TrendChart trends={trends} city={selectedCity} />
              </div>

              <div className="space-y-6">
                <CityMap
                  selectedCity={selectedCity}
                  onSelectCity={setSelectedCity}
                  snapshot={snapshot}
                />

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-2 text-slate-900 font-bold mb-3">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <span>City Environmental Index</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Air Quality is rated{' '}
                      <strong className="text-slate-900">{snapshot.airQuality.status}</strong>{' '}
                      in {selectedCity}.{' '}
                      {snapshot.airQuality.aqi > 200
                        ? 'High atmospheric pollutant concentration detected. Outdoor activities should be limited.'
                        : 'Atmospheric conditions are within acceptable civic thresholds.'}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>ETL Content Hash</span>
                    <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700 truncate max-w-[160px]">
                      {snapshot.contentHash}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-slate-500">
            No telemetry records found for this location.
          </div>
        )}
      </main>
    </div>
  );
};