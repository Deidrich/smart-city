import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import HeroIcon from '../../components/HeroIcon';
import api from '../../utils/api';
import './Transportasi.css';

const JENIS_CONFIG = {
  Bus:    { icon: 'truck', color: '#043CB1', bg: '#EAF1FF' },
  Angkot: { icon: 'truck', color: '#E67E22', bg: '#FDEBD0' },
  BRT:    { icon: 'truck', color: '#7C5CFF', bg: '#F2EFFF' },
};

const HARI_CONFIG = {
  'Setiap Hari': { color: '#043CB1', bg: '#EAF1FF' },
  'Senin-Jumat': { color: '#043CB1', bg: '#EAF1FF' },
  'Sabtu':       { color: '#E67E22', bg: '#FDEBD0' },
  'Minggu':      { color: '#E3B473', bg: '#FFF8EC' },
};

export default function Transportasi() {
  const [routes, setRoutes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingSched, setLoadingSched] = useState(false);
  const [filterJenis, setFilterJenis] = useState('Semua');

  useEffect(() => {
    api.get('/transport').then(r => {
      setRoutes(r.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSelectRoute = async (route) => {
    setSelected(route);
    setLoadingSched(true);
    try {
      const r = await api.get(`/transport/${route.id}`);
      setScheduleData(r.data.data);
    } catch (e) {
      setScheduleData(null);
    } finally {
      setLoadingSched(false);
    }
  };

  const filtered = filterJenis === 'Semua'
    ? routes
    : routes.filter(r => r.jenis === filterJenis);

  return (
    <Layout title="Jadwal Transportasi" subtitle="Rute Bus, Angkot & BRT Kota Medan">
      <div className="transport-layout">
        {/* Sidebar Routes */}
        <div className="transport-sidebar">
          <div className="transport-sidebar-header">
            <h3>Rute Tersedia</h3>
            <div className="transport-filters">
              {['Semua', 'Bus', 'Angkot', 'BRT'].map(f => (
                <button
                  key={f}
                  className={`transport-filter-btn ${filterJenis === f ? 'active' : ''}`}
                  onClick={() => setFilterJenis(f)}
                >
                  <HeroIcon name={JENIS_CONFIG[f]?.icon || 'road'} /> {f}
                </button>
              ))}
            </div>
          </div>

          <div className="route-list">
            {loading ? (
              <div className="route-loading"><span className="icon-inline"><HeroIcon name="arrowPath" /> Memuat rute...</span></div>
            ) : filtered.length === 0 ? (
              <div className="route-empty">Tidak ada rute ditemukan</div>
            ) : (
              filtered.map(route => {
                const cfg = JENIS_CONFIG[route.jenis];
                const isActive = selected?.id === route.id;
                return (
                  <div
                    key={route.id}
                    className={`route-card ${isActive ? 'active' : ''} ${!route.status_aktif ? 'inactive' : ''}`}
                    onClick={() => handleSelectRoute(route)}
                  >
                    <div className="route-card-top">
                      <span className="route-kode" style={{ background: cfg.bg, color: cfg.color }}>{route.kode_rute}</span>
                      <span className="route-jenis-badge" style={{ background: cfg.color + '18', color: cfg.color }}>
                        <HeroIcon name={cfg.icon} /> {route.jenis}
                      </span>
                      {!route.status_aktif && <span className="route-inactive-badge">Tidak Aktif</span>}
                    </div>
                    <div className="route-nama">{route.nama_rute}</div>
                    <div className="route-meta">
                      <span><HeroIcon name="clock" /> {route.jam_operasi_mulai} - {route.jam_operasi_selesai}</span>
                      <span><HeroIcon name="banknotes" /> Rp {(route.tarif || 0).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="transport-detail">
          {!selected ? (
            <div className="transport-placeholder">
              <HeroIcon name="truck" className="placeholder-icon" />
              <h3>Pilih Rute</h3>
              <p>Klik salah satu rute di sebelah kiri untuk melihat jadwal dan detail halte</p>
            </div>
          ) : (
            <div className="route-detail-wrap">
              {/* Header */}
              <div className="route-detail-header">
                <div>
                  <div className="detail-kode">{selected.kode_rute}</div>
                  <h2 className="detail-nama">{selected.nama_rute}</h2>
                </div>
                <span className={`detail-status ${selected.status_aktif ? 'aktif' : 'nonaktif'}`}>
                  <HeroIcon name={selected.status_aktif ? 'check' : 'xCircle'} /> {selected.status_aktif ? 'Aktif' : 'Tidak Aktif'}
                </span>
              </div>

              {/* Info */}
              <div className="detail-info-grid">
                <div className="detail-info-item">
                  <span className="info-label">Terminal Awal</span>
                  <span className="info-val"><HeroIcon name="mapPin" /> {selected.terminal_awal}</span>
                </div>
                <div className="detail-info-item">
                  <span className="info-label">Terminal Akhir</span>
                  <span className="info-val"><HeroIcon name="flag" /> {selected.terminal_akhir}</span>
                </div>
                <div className="detail-info-item">
                  <span className="info-label">Jam Operasi</span>
                  <span className="info-val"><HeroIcon name="clock" /> {selected.jam_operasi_mulai} – {selected.jam_operasi_selesai}</span>
                </div>
                <div className="detail-info-item">
                  <span className="info-label">Tarif</span>
                  <span className="info-val gold"><HeroIcon name="banknotes" /> Rp {(selected.tarif || 0).toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Schedules */}
              <div className="schedule-section">
                <h3 className="schedule-title"><HeroIcon name="document" /> Jadwal Halte</h3>
                {loadingSched ? (
                  <div className="schedule-loading"><span className="icon-inline"><HeroIcon name="arrowPath" /> Memuat jadwal...</span></div>
                ) : !scheduleData?.schedules?.length ? (
                  <div className="schedule-empty">Belum ada data jadwal</div>
                ) : (
                  <div className="schedule-timeline">
                    {scheduleData.schedules
                      .sort((a, b) => a.urutan - b.urutan)
                      .map((s, i, arr) => {
                        const hariCfg = HARI_CONFIG[s.hari] || { color: '#718096', bg: '#F5F7FB' };
                        const isFirst = i === 0;
                        const isLast = i === arr.length - 1;
                        return (
                          <div key={s.id} className={`timeline-item ${isFirst ? 'first' : ''} ${isLast ? 'last' : ''}`}>
                            <div className="timeline-dot"></div>
                            <div className="timeline-line"></div>
                            <div className="timeline-content">
                              <div className="timeline-halte">
                                <span className="timeline-num">{s.urutan}</span>
                                <strong>{s.nama_halte}</strong>
                                {(isFirst || isLast) && (
                                  <span className="timeline-terminal">{isFirst ? 'Awal' : 'Akhir'}</span>
                                )}
                              </div>
                              <div className="timeline-times">
                                <span><HeroIcon name="clock" /> Berangkat: <strong>{s.waktu_keberangkatan}</strong></span>
                                <span><HeroIcon name="mapPin" /> Tiba: <strong>{s.waktu_kedatangan}</strong></span>
                                <span className="hari-badge" style={{ background: hariCfg.bg, color: hariCfg.color }}>
                                  {s.hari}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
