import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import Layout from '../../components/Layout';
import HeroIcon from '../../components/HeroIcon';
import api from '../../utils/api';
import './StatusAirBersih.css';

const GOLD   = '#E3B473';
const BLUE   = '#043CB1';
const RED    = '#C0392B';
const GREEN  = '#1E8449';
const ORANGE = '#CA6F1E';

const statusColor = (status = '') => {
  if (status === 'Normal')           return GREEN;
  if (status === 'Pemeliharaan')     return ORANGE;
  if (status === 'Gangguan')         return RED;
  return GOLD;
};

const pipaColor = (status = '') => {
  if (status === 'Baik')             return GREEN;
  if (status === 'Perlu Perawatan')  return ORANGE;
  if (status === 'Kritis')           return RED;
  return GOLD;
};

const tooltipCustom = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="air-tooltip">
      <strong>{label}</strong>
      {payload.map(item => (
        <span key={item.name}>{item.name}: {Number(item.value).toLocaleString('id-ID')}</span>
      ))}
    </div>
  );
};

export default function StatusAirBersih() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [tab, setTab]         = useState('ringkasan');

  useEffect(() => {
    api.get('/city-services/water-detail')
      .then(res => setData(res.data.data))
      .catch(() => setError('Gagal memuat data air bersih.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Layout title="Status Air Bersih" subtitle="Distribusi PDAM per wilayah">
      <div className="air-loading">Memuat data air bersih...</div>
    </Layout>
  );

  if (error) return (
    <Layout title="Status Air Bersih" subtitle="Distribusi PDAM per wilayah">
      <div className="air-error">{error}</div>
    </Layout>
  );

  const { statuses = [], distributions = [] } = data;

  // Hitung ringkasan
  const totalPelanggan  = distributions.reduce((s, d) => s + (d.pelanggan_aktif || 0), 0);
  const totalKapasitas  = distributions.reduce((s, d) => s + (d.kapasitas_lps   || 0), 0);
  const totalDistribusi = distributions.reduce((s, d) => s + (d.distribusi_lps  || 0), 0);
  const rataKehilangan  = distributions.length
    ? (distributions.reduce((s, d) => s + (d.kehilangan_pct || 0), 0) / distributions.length).toFixed(1)
    : 0;

  const wilayahNormal      = statuses.filter(s => s.status === 'Normal').length;
  const wilayahGangguan    = statuses.filter(s => s.status === 'Gangguan').length;
  const wilayahPemeliharaan = statuses.filter(s => s.status === 'Pemeliharaan').length;

  // Data chart distribusi
  const chartDistribusi = distributions.map(d => ({
    wilayah:    d.wilayah.replace('Medan ', ''),
    Kapasitas:  d.kapasitas_lps,
    Distribusi: d.distribusi_lps,
  }));

  // Data chart kehilangan air
  const chartKehilangan = distributions.map(d => ({
    wilayah:    d.wilayah.replace('Medan ', ''),
    'Kehilangan (%)': d.kehilangan_pct,
  }));

  return (
    <Layout title="Status Air Bersih" subtitle="Distribusi PDAM per wilayah Kota Medan">

      {/*TAB NAV*/}
      <div className="air-tabs">
        {[['ringkasan','Ringkasan'],['distribusi','Distribusi'],['status','Status Wilayah'],['pipa','Kondisi Pipa']].map(([id, label]) => (
          <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>

      {/*RINGKASAN*/}
      {tab === 'ringkasan' && (
        <div>
          <div className="air-stats-grid">
            <div className="air-stat-card">
              <span className="air-stat-icon"><HeroIcon name="people" /></span>
              <div className="air-stat-value">{totalPelanggan.toLocaleString('id-ID')}</div>
              <div className="air-stat-label">Total Pelanggan Aktif</div>
            </div>
            <div className="air-stat-card">
              <span className="air-stat-icon"><HeroIcon name="water" /></span>
              <div className="air-stat-value">{totalKapasitas.toLocaleString('id-ID')} <small>lps</small></div>
              <div className="air-stat-label">Total Kapasitas</div>
            </div>
            <div className="air-stat-card">
              <span className="air-stat-icon"><HeroIcon name="air" /></span>
              <div className="air-stat-value">{totalDistribusi.toLocaleString('id-ID')} <small>lps</small></div>
              <div className="air-stat-label">Total Distribusi</div>
            </div>
            <div className="air-stat-card">
              <span className="air-stat-icon"><HeroIcon name="arrowDownRight" /></span>
              <div className="air-stat-value">{rataKehilangan}<small>%</small></div>
              <div className="air-stat-label">Rata-rata Kehilangan Air</div>
            </div>
          </div>

          <div className="air-badge-row">
            <span className="air-badge normal"><HeroIcon name="check" /> Normal: {wilayahNormal} wilayah</span>
            <span className="air-badge gangguan"><HeroIcon name="xCircle" /> Gangguan: {wilayahGangguan} wilayah</span>
            <span className="air-badge pemeliharaan"><HeroIcon name="warning" /> Pemeliharaan: {wilayahPemeliharaan} wilayah</span>
          </div>
        </div>
      )}

      {/*DISTRIBUSI*/}
      {tab === 'distribusi' && (
        <div className="air-panel">
          <div className="air-panel-head">
            <h2>Kapasitas vs Distribusi per Wilayah</h2>
            <span>Satuan: liter per detik (lps)</span>
          </div>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={chartDistribusi} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDF0F7" />
              <XAxis dataKey="wilayah" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip content={tooltipCustom} />
              <Legend />
              <Bar dataKey="Kapasitas"  fill={BLUE} radius={[4,4,0,0]} />
              <Bar dataKey="Distribusi" fill={GOLD} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>

          <div className="air-panel-head" style={{ marginTop: 32 }}>
            <h2>Tingkat Kehilangan Air per Wilayah</h2>
            <span>Persentase air tidak tersalurkan</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartKehilangan} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDF0F7" />
              <XAxis dataKey="wilayah" tick={{ fontSize: 12 }} />
              <YAxis unit="%" />
              <Tooltip content={tooltipCustom} />
              <Bar dataKey="Kehilangan (%)" radius={[4,4,0,0]}>
                {chartKehilangan.map((entry, i) => (
                  <Cell key={i} fill={entry['Kehilangan (%)'] > 20 ? RED : entry['Kehilangan (%)'] > 12 ? ORANGE : GREEN} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/*STATUS WILAYAH*/}
      {tab === 'status' && (
        <div className="air-panel">
          <div className="air-panel-head">
            <h2>Status Layanan PDAM per Wilayah</h2>
            <span>Diperbarui secara berkala</span>
          </div>
          <div className="air-status-grid">
            {statuses.map(item => (
              <div className="air-status-card" key={item.id}>
                <div className="air-status-header" style={{ borderLeftColor: statusColor(item.status) }}>
                  <strong>{item.wilayah}</strong>
                  <span className="air-badge-status" style={{ background: statusColor(item.status) }}>
                    {item.status}
                  </span>
                </div>
                <div className="air-status-body">
                  <div><span>Debit</span><strong>{item.debit_lps} lps</strong></div>
                  <div><span>Tekanan</span><strong>{item.tekanan_bar} bar</strong></div>
                  <div><span>Estimasi Normal</span><strong>{item.estimasi_normal}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/*KONDISI PIPA */}
      {tab === 'pipa' && (
        <div className="air-panel">
          <div className="air-panel-head">
            <h2>Kondisi Infrastruktur Pipa PDAM</h2>
            <span>Data distribusi dan kondisi jaringan pipa</span>
          </div>
          <table className="air-table">
            <thead>
              <tr>
                <th>Wilayah</th>
                <th>Kecamatan</th>
                <th>Pelanggan</th>
                <th>Kapasitas</th>
                <th>Distribusi</th>
                <th>Kehilangan</th>
                <th>Kondisi Pipa</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {distributions.map(item => (
                <tr key={item.id}>
                  <td>{item.wilayah}</td>
                  <td>{item.kecamatan}</td>
                  <td>{(item.pelanggan_aktif || 0).toLocaleString('id-ID')}</td>
                  <td>{item.kapasitas_lps} lps</td>
                  <td>{item.distribusi_lps} lps</td>
                  <td>
                    <span style={{ color: item.kehilangan_pct > 20 ? RED : item.kehilangan_pct > 12 ? ORANGE : GREEN, fontWeight: 600 }}>
                      {item.kehilangan_pct}%
                    </span>
                  </td>
                  <td>
                    <span className="air-pipa-badge" style={{ background: pipaColor(item.status_pipa) }}>
                      {item.status_pipa}
                    </span>
                  </td>
                  <td className="air-update">{item.update_terakhir}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </Layout>
  );
}
