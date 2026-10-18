# UrbanPulse — Smart City Operating System

UrbanPulse is an enterprise-grade full-stack civic observability platform engineered using the MERN stack. The platform autonomously ingests, transforms, deduplicates, and serves high-cadence environmental telemetry (AQI, PM2.5, ambient temperatures, weather dynamics, and fuel price indices) across major metropolitan regions (Pune, Mumbai, Delhi).

---

## 🏛 System Architecture

UrbanPulse decouples continuous scheduled ingestion from high-throughput client serving:

1. **Extraction Layer**: Multi-threaded Node.js cron workers pull raw telemetry snapshots on automated intervals from OpenWeatherMap and WAQI endpoints, with an integrated autonomous fallback simulator.
2. **Transform & Validation**: Ingestion payloads are sanitized and structurally validated via runtime **Zod** schemas, normalized into standard SI units, and stamped with deterministic ISO timestamps.
3. **Cryptographic Deduplication**: Payloads generate a deterministic **SHA-256 content fingerprint** (`city_timebucket_aqi`) preventing redundant writes during stable weather patterns.
4. **Data Persistence**: Upserted into **MongoDB Atlas** with compound indexes (`{ city: 1, recordedAt: -1 }`) and geospatial indexes (`{ location: "2dsphere" }`).
5. **Analytical Serving**: Server-side MongoDB Aggregation Pipelines compute hourly rollups and statistical trends, serving pre-computed datasets directly to a **React 18** client powered by **Chart.js**, **Leaflet**, and **Tailwind CSS**.

---

## 👥 Module Distribution & Technical Contribution

| Module / Role | Technical Stack | Core Responsibilities |
| :--- | :--- | :--- |
| **Backend & Security** | Express 5, JWT, Bcrypt, Winston, Helmet | Auth subsystem, RBAC access control, centralized error handling, environment validation. |
| **Data Engineering** | Node-cron, Axios, Zod, SHA-256, Crypto | Automated ETL pipelines, high-cadence polling, schema validation, data deduplication. |
| **Database & Analytics** | MongoDB Atlas, Mongoose, Aggregations | Geospatial 2dsphere indexing, hourly time-series aggregation pipelines, audit log schemas. |
| **Client UI/UX** | React 18, Vite, Tailwind CSS, Lucide | Responsive dashboard, KPI cards, real-time polling pulse, city switching controls. |
| **Geospatial & Visuals** | Chart.js, React-Chartjs-2, Leaflet | Dynamic dual-axis time-series visualization, interactive OpenStreetMap canvas with dynamic marker fly-to. |

---

## 🚀 Local Deployment Guide

### Prerequisites
- Node.js (v18+ or v22 LTS)
- MongoDB Atlas cluster or local MongoDB instance

### 1. Backend Server Setup
```bash
cd server
npm install
cp .env.example .env   # Configure PORT, MONGO_URI, and JWT secrets
npm run dev