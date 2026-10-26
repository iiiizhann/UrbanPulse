import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateGrievanceDocket = ({ selectedCity, snapshot, trends }) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor = [15, 23, 42]; // Slate-900
  const accentColor = [13, 148, 136]; // Teal-600
  const dateStr = new Date().toLocaleString();
  const docketId = `UP-GRV-${selectedCity.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-6)}`;

  // Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('URBANPULSE CIVIC TELEMETRY VERIFICATION DOCKET', 14, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Official Environmental Telemetry & Compliance Violation Record', 14, 23);
  doc.text(`Docket No: ${docketId}  |  Generated: ${dateStr}`, 14, 30);

  // Authority Block
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('SUBMISSION RECIPIENT:', 14, 46);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text([
    `To: Municipal Commissioner / State Pollution Control Board`,
    `Jurisdiction: ${selectedCity} Metropolitan Urban Development Authority`,
    `Subject: Formal Environmental Telemetry Report and Exceedance Record`,
  ], 14, 52);

  // Snapshot Summary Card
  const aqi = snapshot?.airQuality?.aqi ?? 'N/A';
  const status = snapshot?.airQuality?.status ?? 'Unknown';
  const temp = snapshot?.weather?.temperature ?? 'N/A';
  const pm25 = snapshot?.airQuality?.pm25 ?? 'N/A';
  const pm10 = snapshot?.airQuality?.pm10 ?? 'N/A';
  const hash = snapshot?.contentHash || 'N/A';

  autoTable(doc, {
    startY: 68,
    head: [['Target Sensor Node', 'Metric', 'Observed Value', 'Statutory / Normative Baseline', 'Compliance Status']],
    body: [
      [`${selectedCity} Central Node`, 'Air Quality Index (AQI)', `${aqi}`, '≤ 100 (Safe / Moderate)', aqi > 100 ? 'EXCEEDED' : 'COMPLIANT'],
      [`${selectedCity} Central Node`, 'PM2.5 Concentration', `${pm25} µg/m³`, '≤ 60 µg/m³ (NAAQS 24h)', pm25 > 60 ? 'EXCEEDED' : 'COMPLIANT'],
      [`${selectedCity} Central Node`, 'PM10 Concentration', `${pm10} µg/m³`, '≤ 100 µg/m³ (NAAQS 24h)', pm10 > 100 ? 'EXCEEDED' : 'COMPLIANT'],
      [`${selectedCity} Micro-station`, 'Ambient Temperature', `${temp} °C`, 'Seasonal Ambient', 'RECORDED'],
    ],
    theme: 'striped',
    headStyles: { fillColor: primaryColor, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  // Cryptographic Provenance Block
  const finalY = doc.lastAutoTable.finalY + 8;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, finalY, 182, 22, 2, 2, 'F');
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...accentColor);
  doc.text('CRYPTOGRAPHIC AUDIT PROVENANCE (SHA-256 DETERMINISTIC HASH):', 18, finalY + 7);

  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text(hash, 18, finalY + 14);

  // 24-Hour Exceedance Log Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('24-Hour Ingestion & Exceedance Trail:', 14, finalY + 31);

  const trendRows = (trends || []).slice(0, 10).map((t) => [
    t.timestamp || t.recordedAt || 'N/A',
    `${t.avgAqi ?? 'N/A'}`,
    `${t.maxAqi ?? 'N/A'}`,
    `${t.avgTemperature ?? 'N/A'} °C`,
    `${t.avgPm25 ?? 'N/A'} µg/m³`,
    (t.maxAqi > 100 || t.avgAqi > 100) ? 'Breach' : 'Nominal',
  ]);

  autoTable(doc, {
    startY: finalY + 34,
    head: [['Observation Timestamp', 'Avg AQI', 'Peak AQI', 'Avg Temp', 'Avg PM2.5', 'Threshold']],
    body: trendRows.length > 0 ? trendRows : [['No historical trends logged for current window', '-', '-', '-', '-', '-']],
    theme: 'plain',
    headStyles: { fillColor: [226, 232, 240], textColor: [15, 23, 42], fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7.5 },
  });

  // Footer / Certification Signoff
  const pageHeight = doc.internal.pageSize.height;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'This document is machine-generated via UrbanPulse Civic Telemetry Engine. Tamper-evident verification available via SHA-256 hash.',
    14,
    pageHeight - 12
  );

  doc.save(`${selectedCity}_Civic_Grievance_Docket_${new Date().toISOString().slice(0, 10)}.pdf`);
};