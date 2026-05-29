import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import './Udara.css';

const getAQIConfig = (aqi) => {
  if (aqi <= 50)  return { label: 'Baik', color: '#043CB1', bg: '#EAF1FF', text: '#162A5A' };
  if (aqi <= 100) return { label: 'Sedang', color: '#F39C12', bg: '#FEF9E7', text: '#7D6608' };
  if (aqi <= 150) return { label: 'Tidak Sehat', color: '#E74C3C', bg: '#FDEDEC', text: '#922B21' };
  if (aqi <= 200) return { label: 'Sangat Tidak Sehat', color: '#9B59B6', bg: '#F2EFFF', text: '#6C3483' };
  return { label: 'Berbahaya', color: '#7B241C', bg: '#F9EBEA', text: '#7B241C' };
};

const AQICard = ({ data }) => {
  const cfg = getAQIConfig(data.aqi);
  return (
    <div className="aqi-card" style={{ borderLeft: `4px solid ${cfg.color}` }}>
      <div className="aqi-card-top">
        <div>
          <div className="aqi-kecamatan">{data.kecamatan}</div>
          <span className="aqi-status-badge" style={{ background: cfg.bg, color: cfg.text }}>
            {cfg.label}
          </span>
        </div>
        <div className="aqi-number" style={{ color: cfg.color }}>{data.aqi}</div>
      </div>
      <div className="aqi-details">
        <div className="aqi-detail-item">
          <span>PM2.5</span>
          <strong>{data.pm25} μg/m³</strong>
        </div>
        <div className="aqi-detail-item">
          <span>PM10</span>
          <strong>{data.pm10} μg/m³</strong>
        </div>
        <div className="aqi-detail-item">
          <span>CO</span>
          <strong>{data.co} ppm</strong>
        </div>
      </div>
    </div>
  );
};

const CustomBar = ({ x, y, width, height, aqi }) => {
  const cfg = getAQIConfig(aqi);
  return <rect x={x} y={y} width={width} height={height} fill={cfg.color} rx={4} />;
};

export default function KualitasUdara() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('aqi');

  useEffect(() => {
    api.get('/air-quality').then(r => {
      setData(r.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const sorted = [...data].sort((a, b) =>
    sortBy === 'aqi' ? b.aqi - a.aqi : a.kecamatan.localeCompare(b.kecamatan)
  );

  const counts = { Baik: 0, Sedang: 0, 'Tidak Sehat': 0, 'Sangat Tidak Sehat': 0, Berbahaya: 0 };
  data.forEach(d => {
    const cfg = getAQIConfig(d.aqi);
    counts[cfg.label] = (counts[cfg.label] || 0) + 1;
  });

  if (loading) return (
    <Layout title="Kualitas Udara" subtitle="Monitoring AQI per Kecamatan Kota Medan">
      <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-light)' }}>⏳ Memuat data...</div>
    </Layout>
  );

  return (
    <Layout title="Kualitas Udara" subtitle="Monitoring AQI per Kecamatan Kota Medan">
      {/* AQI Scale */}
      <div className="aqi-scale">
        <span className="aqi-scale-label">Skala AQI:</span>
        {[
          { label: '0-50 Baik', color: '#043CB1' },
          { label: '51-100 Sedang', color: '#F39C12' },
          { label: '101-150 Tidak Sehat', color: '#E74C3C' },
          { label: '151-200 Sangat Tidak Sehat', color: '#9B59B6' },
          { label: '201+ Berbahaya', color: '#7B241C' },
        ].map(s => (
          <span key={s.label} className="aqi-scale-item" style={{ background: s.color + '22', color: s.color, border: `1px solid ${s.color}44` }}>
            {s.label}
          </span>
        ))}
      </div>

      {/* Summary pills */}
      <div className="aqi-summary-row">
        {Object.entries(counts).filter(([,v]) => v > 0).map(([label, count]) => {
          const cfg = getAQIConfig(label === 'Baik' ? 25 : label === 'Sedang' ? 75 : label === 'Tidak Sehat' ? 125 : label === 'Sangat Tidak Sehat' ? 175 : 250);
          return (
            <div key={label} className="aqi-sum-pill" style={{ background: cfg.bg, borderColor: cfg.color }}>
              <span style={{ color: cfg.color, fontWeight: 700, fontSize: 22 }}>{count}</span>
              <span style={{ color: cfg.text, fontSize: 12 }}>{label}</span>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="chart-card" style={{ marginBottom: 24 }}>
        <div className="chart-header">
          <h3>AQI Per Kecamatan</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className={`sort-btn ${sortBy === 'aqi' ? 'active' : ''}`} onClick={() => setSortBy('aqi')}>Urutkan AQI</button>
            <button className={`sort-btn ${sortBy === 'nama' ? 'active' : ''}`} onClick={() => setSortBy('nama')}>Nama A-Z</button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={sorted} margin={{ top: 5, right: 10, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EDF0F7" />
            <XAxis dataKey="kecamatan" tick={{ fontSize: 11, fill: '#718096' }} angle={-35} textAnchor="end" interval={0} />
            <YAxis tick={{ fontSize: 11, fill: '#718096' }} domain={[0, 200]} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload?.length) {
                  const d = payload[0].payload;
                  const cfg = getAQIConfig(d.aqi);
                  return (
                    <div style={{ background: '#111E43', padding: '10px 14px', borderRadius: 14, border: `1px solid ${cfg.color}44` }}>
                      <p style={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}>{d.kecamatan}</p>
                      <p style={{ color: cfg.color, fontSize: 18, fontWeight: 700 }}>AQI: {d.aqi}</p>
                      <p style={{ color: '#aaa', fontSize: 12 }}>{cfg.label}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="aqi" radius={[4, 4, 0, 0]}>
              {sorted.map((entry, i) => (
                <Cell key={i} fill={getAQIConfig(entry.aqi).color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Grid Cards */}
      <div className="aqi-grid">
        {sorted.map(d => <AQICard key={d.id} data={d} />)}
      </div>
    </Layout>
  );
}
