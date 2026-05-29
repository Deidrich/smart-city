import { useEffect, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MapContainer, TileLayer, Marker, Popup, LayerGroup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Layout from '../../components/Layout';
import HeroIcon from '../../components/HeroIcon';
import api from '../../utils/api';
import './Peta.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const ICONS = {
  'Rumah Sakit': { icon: 'health', color: '#e74c3c' },
  'Sekolah':     { icon: 'school', color: '#043CB1' },
  'Taman':       { icon: 'park', color: '#F0C98A' },
  'Kantor Pemerintah': { icon: 'government', color: '#7C5CFF' },
  'Pasar':       { icon: 'banknotes', color: '#E67E22' },
  'Masjid':      { icon: 'building', color: '#E3B473' },
};

const createCustomIcon = (jenis) => {
  const cfg = ICONS[jenis] || { icon: 'mapPin', color: '#E3B473' };
  const iconMarkup = renderToStaticMarkup(<HeroIcon name={cfg.icon} style={{ width: 18, height: 18 }} />);
  return L.divIcon({
    html: `<div style="
      background:${cfg.color};
      width:36px;height:36px;border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
      display:flex;align-items:center;justify-content:center;
      color:white;
    "><span style="transform:rotate(45deg);display:flex;align-items:center;justify-content:center;">${iconMarkup}</span></div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

const FILTER_OPTIONS = ['Semua', 'Rumah Sakit', 'Sekolah', 'Taman', 'Kantor Pemerintah', 'Pasar', 'Masjid'];

export default function PetaInteraktif() {
  const [facilities, setFacilities] = useState([]);
  const [filter, setFilter] = useState('Semua');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/facilities').then(r => {
      setFacilities(r.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = filter === 'Semua' ? facilities : facilities.filter(f => f.jenis === filter);

  return (
    <Layout title="Peta Interaktif" subtitle="Fasilitas publik Kota Medan">
      <div className="peta-wrap">
        {/* Filter Bar */}
        <div className="peta-filters">
          <span className="peta-filter-label">Filter:</span>
          {FILTER_OPTIONS.map(opt => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={`peta-filter-btn ${filter === opt ? 'active' : ''}`}
            >
              {opt !== 'Semua' && <HeroIcon name={ICONS[opt]?.icon} />}
              {opt}
            </button>
          ))}
          <span className="peta-count">{filtered.length} lokasi</span>
        </div>

        {/* Legend */}
        <div className="peta-legend">
          {Object.entries(ICONS).map(([jenis, cfg]) => (
            <div key={jenis} className="legend-item">
              <span className="legend-dot" style={{ background: cfg.color }}><HeroIcon name={cfg.icon} /></span>
              <span>{jenis}</span>
            </div>
          ))}
        </div>

        {/* Map */}
        <div className="map-container">
          {!loading && (
            <MapContainer
              center={[3.5896, 98.6739]}
              zoom={13}
              style={{ height: '100%', width: '100%', borderRadius: 22 }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              />
              <LayerGroup>
                {filtered.map(f => (
                  <Marker
                    key={f.id}
                    position={[f.lat, f.lng]}
                    icon={createCustomIcon(f.jenis)}
                  >
                    <Popup maxWidth={260}>
                      <div className="popup-content">
                        <div className="popup-header">
                          <span className="popup-emoji"><HeroIcon name={ICONS[f.jenis]?.icon || 'mapPin'} /></span>
                          <div>
                            <div className="popup-nama">{f.nama}</div>
                            <span className="popup-jenis" style={{ background: ICONS[f.jenis]?.color + '22', color: ICONS[f.jenis]?.color }}>
                              {f.jenis}
                            </span>
                          </div>
                        </div>
                        <div className="popup-body">
                          {f.alamat && <p><HeroIcon name="mapPin" /> {f.alamat}</p>}
                          {f.kecamatan && <p><HeroIcon name="city" /> {f.kecamatan}</p>}
                          {f.telepon && <p><HeroIcon name="phone" /> {f.telepon}</p>}
                          {f.jam_buka && <p><HeroIcon name="clock" /> {f.jam_buka}</p>}
                          {f.deskripsi && <p className="popup-desc">{f.deskripsi}</p>}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </LayerGroup>
            </MapContainer>
          )}
          {loading && <div className="map-loading"><span className="icon-inline"><HeroIcon name="arrowPath" /> Memuat peta...</span></div>}
        </div>
      </div>
    </Layout>
  );
}
