import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const TrendChart = ({ trends, city }) => {
  if (!trends || trends.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-slate-400 bg-white rounded-xl border border-slate-200">
        Collecting continuous time-series snapshots...
      </div>
    );
  }

  const labels = trends.map((item) => item.timestamp.split(' ')[1] || item.timestamp);

  const data = {
    labels,
    datasets: [
      {
        label: 'Air Quality (AQI)',
        data: trends.map((t) => t.avgAqi),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        fill: true,
        tension: 0.35,
        yAxisID: 'yAqi',
      },
      {
        label: 'Temperature (°C)',
        data: trends.map((t) => t.avgTemperature),
        borderColor: '#0284c7',
        backgroundColor: 'transparent',
        tension: 0.35,
        yAxisID: 'yTemp',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: `${city} Sensor Telemetry (Hourly Rollup)`,
        font: { size: 14, weight: 'bold' },
      },
    },
    scales: {
      yAqi: {
        type: 'linear',
        position: 'left',
        title: { display: true, text: 'AQI' },
      },
      yTemp: {
        type: 'linear',
        position: 'right',
        grid: { drawOnChartArea: false },
        title: { display: true, text: 'Temp (°C)' },
      },
    },
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm h-80">
      <Line data={data} options={options} />
    </div>
  );
};