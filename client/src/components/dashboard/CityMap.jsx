import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix standard Leaflet default marker icons in bundlers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Component to smoothly pan the map when a city is selected
const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 10, { duration: 1.5 });
  }, [center, map]);
  return null;
};

const CITY_COORDINATES = {
  Pune: [18.5204, 73.8567],
  Mumbai: [19.076, 72.8777],
  Delhi: [28.6139, 77.209],
};

export const CityMap = ({ selectedCity, onSelectCity, snapshot }) => {
  const currentCenter = CITY_COORDINATES[selectedCity] || [18.5204, 73.8567];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-900">Geospatial Telemetry Map</h3>
        <span className="text-xs text-slate-500 font-mono">2dsphere Indexed</span>
      </div>

      <div className="h-72 w-full rounded-lg overflow-hidden border border-slate-100 z-10">
        <MapContainer
          center={currentCenter}
          zoom={10}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <RecenterMap center={currentCenter} />

          {Object.entries(CITY_COORDINATES).map(([cityName, coords]) => (
            <Marker
              key={cityName}
              position={coords}
              eventHandlers={{
                click: () => onSelectCity(cityName),
              }}
            >
              <Popup>
                <div className="text-xs font-sans">
                  <strong className="text-slate-900 text-sm block">{cityName}</strong>
                  {cityName === selectedCity && snapshot ? (
                    <div className="mt-1 space-y-0.5 text-slate-600">
                      <div>AQI: <strong className="text-slate-900">{snapshot.airQuality.aqi}</strong></div>
                      <div>Temp: <strong className="text-slate-900">{snapshot.weather.temperature}°C</strong></div>
                      <div>Status: <span className="font-semibold text-teal-600">{snapshot.airQuality.status}</span></div>
                    </div>
                  ) : (
                    <span className="text-slate-400">Click to load active sensor stream</span>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};