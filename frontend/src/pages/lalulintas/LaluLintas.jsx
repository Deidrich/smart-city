import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Layout from '../../components/Layout';
import HeroIcon from '../../components/HeroIcon';
import api from '../../utils/api';
import './LaluLintas.css';

const STATUS_CONFIG = {
  Lancar: { color: '#043CB1', bg: '#EAF1FF', text: '#162A5A', icon: 'check' },
  Padat:  { color: '#F39C12', bg: '#FEF9E7', text: '#7D6608', icon: 'warning' },
  Macet:  { color: '#E74C3C', bg: '#FDEDEC', text: '#922B21', icon: 'xCircle' },
};

export default function LaluLintas() {
  const [traffic, setTraffic] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [routePaths, setRoutePaths] = useState({});
  const [filterStatus, setFilterStatus] = useState('Semua');

  useEffect(() => {
    Promise.all([
      api.get('/traffic'),
      api.get('/traffic/summary'),
    ]).then(([t, s]) => {
      setTraffic(t.data.data);
      setSummary(s.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!traffic.length) return;

    let cancelled = false;

    const loadRoadPaths = async () => {
      const paths = {};

      await Promise.all(traffic.map(async (item) => {
        if (!item.lat_start || !item.lng_start || !item.lat_end || !item.lng_end) return;

        const fallbackPath = [
          [Number(item.lat_start), Number(item.lng_start)],
          [Number(item.lat_end), Number(item.lng_end)],
        ];

        if (Array.isArray(item.path) && item.path.length > 1) {
          paths[item.id] = item.path.map(([lat, lng]) => [Number(lat), Number(lng)]);
          return;
        }

        try {
          const url = `https://router.project-osrm.org/route/v1/driving/${item.lng_start},${item.lat_start};${item.lng_end},${item.lat_end}?overview=full&geometries=geojson`;
          const response = await fetch(url);
          if (!response.ok) throw new Error('Route request failed');

          const result = await response.json();
          const coordinates = result.routes?.[0]?.geometry?.coordinates;
          paths[item.id] = coordinates?.length
            ? coordinates.map(([lng, lat]) => [lat, lng])
            : fallbackPath;
        } catch {
          paths[item.id] = fallbackPath;
        }
      }));

      if (!cancelled) setRoutePaths(paths);
    };

    loadRoadPaths();

    return () => {
      cancelled = true;
    };
  }, [traffic]);

  const filtered = filterStatus === 'Semua'
    ? traffic
    : traffic.filter(t => t.status === filterStatus);

  return (
    <Layout title="Status Lalu Lintas" subtitle="Pemantauan Jalan Utama Kota Medan">
      {/* Summary */}
      {summary && (
        <div className="traffic-summary">
          {['Lancar', 'Padat', 'Macet'].map(s => (
            <div key={s} className="traffic-sum-card" style={{ borderColor: STATUS_CONFIG[s].color }}>
              <HeroIcon name={STATUS_CONFIG[s].icon} style={{ fontSize: 28, color: STATUS_CONFIG[s].color }} />
              <span className="traffic-sum-num" style={{ color: STATUS_CONFIG[s].color }}>{summary[s.toLowerCase()]}</span>
              <span className="traffic-sum-label">{s}</span>
            </div>
          ))}
          <div className="traffic-sum-card" style={{ borderColor: '#E3B473' }}>
            <HeroIcon name="road" style={{ fontSize: 28, color: '#E3B473' }} />
            <span className="traffic-sum-num" style={{ color: '#E3B473' }}>{summary.total}</span>
            <span className="traffic-sum-label">Total Ruas</span>
          </div>
        </div>
      )}

      <div className="traffic-layout">
        {/* Table */}
        <div className="traffic-table-wrap">
          <div className="traffic-table-header">
            <h3>Daftar Ruas Jalan</h3>
            <div className="traffic-filters">
              {['Semua', 'Lancar', 'Padat', 'Macet'].map(f => (
                <button
                  key={f}
                  className={`trf-filter-btn ${filterStatus === f ? 'active' : ''}`}
                  style={filterStatus === f && f !== 'Semua' ? { background: STATUS_CONFIG[f]?.color, borderColor: STATUS_CONFIG[f]?.color } : {}}
                  onClick={() => setFilterStatus(f)}
                >
                  {f !== 'Semua' && <HeroIcon name={STATUS_CONFIG[f]?.icon} />} {f}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="table-loading"><span className="icon-inline"><HeroIcon name="arrowPath" /> Memuat data...</span></div>
          ) : (
            <table className="traffic-table">
              <thead>
                <tr>
                  <th>Nama Jalan</th>
                  <th>Ruas</th>
                  <th>Status</th>
                  <th>Kecepatan</th>
                  <th>Kendaraan/Jam</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => {
                  const cfg = STATUS_CONFIG[t.status];
                  return (
                    <tr key={t.id} className="traffic-row">
                      <td><strong>{t.nama_jalan}</strong></td>
                      <td className="traffic-ruas">{t.ruas}</td>
                      <td>
                        <span className="status-badge" style={{ background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.color}44` }}>
                          <HeroIcon name={cfg.icon} /> {t.status}
                        </span>
                      </td>
                      <td>
                        <span className="speed-val" style={{ color: cfg.color }}>
                          {t.kecepatan_kmh} km/h
                        </span>
                      </td>
                      <td>{(t.kendaraan_per_jam || 0).toLocaleString('id-ID')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Map */}
        <div className="traffic-map-wrap">
          <div className="traffic-map-title">Peta Kondisi Jalan</div>
          <div className="traffic-map">
            {!loading && (
              <MapContainer center={[3.5896, 98.6739]} zoom={13} style={{ height: '100%', width: '100%', borderRadius: 16 }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='© <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                />
                {traffic.map(t => {
                  if (!t.lat_start || !t.lat_end) return null;
                  const cfg = STATUS_CONFIG[t.status];
                  const positions = routePaths[t.id]
                    || t.path
                    || [[t.lat_start, t.lng_start], [t.lat_end, t.lng_end]];

                  return (
                    <Polyline
                      key={t.id}
                      positions={positions}
                      color={cfg.color}
                      weight={5}
                      opacity={0.85}
                    >
                      <Popup>
                        <div>
                          <strong>{t.nama_jalan}</strong><br />
                          <span>{t.ruas}</span><br />
                          <span style={{ color: cfg.color, fontWeight: 700 }}>{t.status}</span><br />
                          <span>{t.kecepatan_kmh} km/h · {(t.kendaraan_per_jam || 0).toLocaleString()} kendaraan/jam</span>
                        </div>
                      </Popup>
                    </Polyline>
                  );
                })}
              </MapContainer>
            )}
          </div>
          {/* Map Legend */}
          <div className="map-legend">
            {Object.entries(STATUS_CONFIG).map(([s, cfg]) => (
              <div key={s} className="map-legend-item">
                <div className="map-legend-line" style={{ background: cfg.color }}></div>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
