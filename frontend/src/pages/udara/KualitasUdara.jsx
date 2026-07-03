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

const getHealthRecommendations = (aqi) => {
  if (aqi <= 50) {
    return [
      { icon: '😷', title: 'Masker', desc: 'Tidak Perlu' },
      { icon: '🏠', title: 'Jendela', desc: 'Buka Jendela' },
      { icon: '🏃‍♂️', title: 'Olahraga', desc: 'Sangat Aman' }
    ];
  }
  if (aqi <= 100) {
    return [
      { icon: '😷', title: 'Masker', desc: 'Opsional' },
      { icon: '🏠', title: 'Jendela', desc: 'Buka Jendela' },
      { icon: '🏃‍♂️', title: 'Olahraga', desc: 'Aktivitas Normal' }
    ];
  }
  if (aqi <= 150) {
    return [
      { icon: '😷', title: 'Masker', desc: 'Gunakan Masker' },
      { icon: '🏠', title: 'Jendela', desc: 'Tutup Jendela' },
      { icon: '🏃‍♂️', title: 'Olahraga', desc: 'Kurangi Aktivitas' }
    ];
  }
  return [
    { icon: '😷', title: 'Masker', desc: 'Wajib Masker N95' },
    { icon: '🏠', title: 'Jendela', desc: 'Tutup Rapat' },
    { icon: '🏃‍♂️', title: 'Olahraga', desc: 'Hindari Outdoor' }
  ];
};

const getAQIBgImage = (aqi) => {
  if (aqi <= 50)  return '/images/aqi-good.jpg';
  if (aqi <= 100) return '/images/aqi-moderate.jpg';
  return '/images/aqi-unhealthy.jpg';
};

const AQICard = ({ data, isActive }) => {
  const cfg = getAQIConfig(data.aqi);
  return (
    <div className={`aqi-card ${isActive ? 'active' : ''}`} style={{ borderLeft: `4px solid ${cfg.color}` }}>
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
          <strong>{data.pm25}</strong>
        </div>
        <div className="aqi-detail-item">
          <span>PM10</span>
          <strong>{data.pm10}</strong>
        </div>
        <div className="aqi-detail-item">
          <span>CO</span>
          <strong>{data.co}</strong>
        </div>
      </div>
    </div>
  );
};

export default function KualitasUdara() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('aqi');
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    api.get('/air-quality').then(r => {
      setData(r.data.data);
      if (r.data.data?.length > 0) {
        // Find worst AQI to display as default hero
        const sortedAqi = [...r.data.data].sort((a, b) => b.aqi - a.aqi);
        setSelectedId(sortedAqi[0].id);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const sorted = [...data].sort((a, b) =>
    sortBy === 'aqi' ? b.aqi - a.aqi : a.kecamatan.localeCompare(b.kecamatan)
  );

  const selectedItem = data.find(item => item.id === selectedId) || sorted[0] || null;

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

      {/* INTERACTIVE HERO CARD */}
      {selectedItem && (
        <div className="aqi-hero-card">
          <div className="aqi-hero-bg-img" style={{ backgroundImage: `url(${getAQIBgImage(selectedItem.aqi)})` }} />
          <div className="aqi-hero-bg-overlay" />
          <div className="aqi-hero-glow" style={{ background: getAQIConfig(selectedItem.aqi).color }} />
          
          {/* Radial Gauge Column */}
          <div className="aqi-gauge-panel">
            <div className="aqi-gauge-wrap">
              <svg className="aqi-gauge-svg" viewBox="0 0 120 120">
                <circle className="aqi-gauge-bg" cx="60" cy="60" r="50" />
                <circle 
                  className="aqi-gauge-fill" 
                  cx="60" 
                  cy="60" 
                  r="50" 
                  stroke={getAQIConfig(selectedItem.aqi).color}
                  strokeDasharray={2 * Math.PI * 50}
                  strokeDashoffset={2 * Math.PI * 50 - (Math.min(selectedItem.aqi, 300) / 300) * (2 * Math.PI * 50)}
                />
              </svg>
              <div className="aqi-gauge-text">
                <span className="aqi-gauge-number" style={{ color: getAQIConfig(selectedItem.aqi).color }}>{selectedItem.aqi}</span>
                <span className="aqi-gauge-label">AQI</span>
              </div>
            </div>
            <div className="aqi-gauge-kecamatan">{selectedItem.kecamatan}</div>
            <span className="aqi-gauge-status" style={{ background: getAQIConfig(selectedItem.aqi).bg, color: getAQIConfig(selectedItem.aqi).text }}>
              {getAQIConfig(selectedItem.aqi).label}
            </span>
          </div>

          {/* Details & Pollutants & Recommendations Column */}
          <div className="aqi-details-panel">
            {/* Pollutant Bars */}
            <div className="aqi-pollutants-section">
              <h4>Rincian Polutan</h4>
              <div className="aqi-bars-grid">
                <div className="aqi-bar-item">
                  <div className="aqi-bar-label">
                    <span>PM2.5</span>
                    <span>{selectedItem.pm25} μg/m³</span>
                  </div>
                  <div className="aqi-progress-container">
                    <div className="aqi-progress-bar" style={{ width: `${Math.min((selectedItem.pm25 / 150) * 100, 100)}%`, background: getAQIConfig(selectedItem.aqi).color }} />
                  </div>
                </div>
                <div className="aqi-bar-item">
                  <div className="aqi-bar-label">
                    <span>PM10</span>
                    <span>{selectedItem.pm10} μg/m³</span>
                  </div>
                  <div className="aqi-progress-container">
                    <div className="aqi-progress-bar" style={{ width: `${Math.min((selectedItem.pm10 / 150) * 100, 100)}%`, background: getAQIConfig(selectedItem.aqi).color }} />
                  </div>
                </div>
                <div className="aqi-bar-item">
                  <div className="aqi-bar-label">
                    <span>CO</span>
                    <span>{selectedItem.co} ppm</span>
                  </div>
                  <div className="aqi-progress-container">
                    <div className="aqi-progress-bar" style={{ width: `${Math.min((selectedItem.co / 15) * 100, 100)}%`, background: getAQIConfig(selectedItem.aqi).color }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="aqi-recommendations-section">
              <h4>Rekomendasi Aktivitas Sehat</h4>
              <div className="aqi-recs-grid">
                {getHealthRecommendations(selectedItem.aqi).map((rec, idx) => (
                  <div className="aqi-rec-box" key={idx}>
                    <span className="aqi-rec-icon">{rec.icon}</span>
                    <div className="aqi-rec-text">
                      <span className="aqi-rec-title">{rec.title}</span>
                      <span className="aqi-rec-desc">{rec.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Grid Cards (Kecamatan List) */}
      <div className="aqi-grid">
        {sorted.map(d => (
          <div key={d.id} onClick={() => setSelectedId(d.id)}>
            <AQICard data={d} isActive={selectedItem && selectedItem.id === d.id} />
          </div>
        ))}
      </div>
    </Layout>
  );
}
