import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import './LayananPublik.css';

const GOLD = '#E3B473';
const GOLD_LIGHT = '#F0C98A';
const NAVY = '#111E43';
const BLUE = '#043CB1';
const RED = '#C0392B';
const PURPLE = '#7C5CFF';
const ATCS_STREAM_URL = 'https://atcsdishub.medan.go.id/stream';
const ATCS_FEATURED_CAMERA_URL = `${ATCS_STREAM_URL}/L1RADENSALEHBALAIKOTA/`;
const OFFICIAL_CCTV_CAMERAS = [
  {
    nama: 'RADEN SALEH - BALAI KOTA',
    lokasi: 'Simpang Lapangan Merdeka',
    poster: 'https://atcsdishub.medan.go.id/poster/RADENSALEHBALAIKOTA_1_1346.jpg',
    stream: ATCS_FEATURED_CAMERA_URL,
  },
  {
    nama: 'AHMAD YANI - PULAU PINANG',
    lokasi: 'Simpang Lonsum',
    poster: 'https://atcsdishub.medan.go.id/poster/AHMADYANIPULAUPINANG_2_1346.jpg',
  },
  {
    nama: 'KESAWAN - PALANG MERAH',
    lokasi: 'Simpang Kesawan',
    poster: 'https://atcsdishub.medan.go.id/poster/KESAWANPALANGMERAH_3_1346.jpg',
  },
  {
    nama: 'KATAMSO - ANI IDRUS',
    lokasi: 'Simpang Waspada',
    poster: 'https://atcsdishub.medan.go.id/poster/KATAMSOANIIDRUS_4_1346.jpg',
  },
];

const tabs = [
  ['rs', 'Rumah Sakit'],
  ['cctv', 'CCTV'],
  ['alert', 'Alert'],
  ['health', 'Kesehatan'],
  ['edu', 'Pendidikan'],
  ['jobs', 'Lowongan'],
  ['umkm', 'UMKM'],
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="pub-tooltip">
      <strong>{label}</strong>
      {payload.map(item => <span key={item.name}>{item.name}: {Number(item.value).toLocaleString('id-ID')}</span>)}
    </div>
  );
};

export default function LayananPublik() {
  const { user } = useAuth();
  const [active, setActive] = useState('rs');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Job Filters & Modal State
  const [jobSearch, setJobSearch] = useState('');
  const [jobCategory, setJobCategory] = useState('Semua');
  const [jobType, setJobType] = useState('Semua');
  const [showJobModal, setShowJobModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [submittingJob, setSubmittingJob] = useState(false);

  const [newJob, setNewJob] = useState({
    posisi: '',
    perusahaan: '',
    kategori: 'Teknologi',
    lokasi: 'Medan Petisah',
    tipe: 'Full-time',
    gaji: 'Rp 4 - 6 Juta',
    deskripsi: '',
    persyaratan: '',
    kontak: '',
    deadline: '2026-09-30',
  });

  const load = async () => {
    const res = await api.get('/public-services');
    setData(res.data.data);
  };

  useEffect(() => {
    load().catch(() => setMessage('Gagal memuat data layanan publik.')).finally(() => setLoading(false));
  }, []);

  const filteredJobs = useMemo(() => {
    if (!data?.jobs) return [];
    return data.jobs.filter(job => {
      const matchSearch = jobSearch === '' || 
        job.posisi.toLowerCase().includes(jobSearch.toLowerCase()) || 
        job.perusahaan.toLowerCase().includes(jobSearch.toLowerCase());
      const matchCat = jobCategory === 'Semua' || job.kategori === jobCategory;
      const matchType = jobType === 'Semua' || job.tipe === jobType;
      return matchSearch && matchCat && matchType;
    });
  }, [data, jobSearch, jobCategory, jobType]);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!newJob.posisi || !newJob.perusahaan || !newJob.lokasi || !newJob.kontak) {
      toast.error('Mohon lengkapi field wajib.');
      return;
    }
    setSubmittingJob(true);
    try {
      await api.post('/public-services/jobs', newJob);
      toast.success('Lowongan berhasil dikirim dan menunggu verifikasi admin!');
      setShowJobModal(false);
      setNewJob({
        posisi: '',
        perusahaan: '',
        kategori: 'Teknologi',
        lokasi: 'Medan Petisah',
        tipe: 'Full-time',
        gaji: 'Rp 4 - 6 Juta',
        deskripsi: '',
        persyaratan: '',
        kontak: '',
        deadline: '2026-09-30',
      });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengirim lowongan.');
    } finally {
      setSubmittingJob(false);
    }
  };

  const handleReportJob = async (jobId) => {
    try {
      await api.post(`/public-services/jobs/${jobId}/report`);
      toast.success('Laporan berhasil dikirim ke Admin Kota.');
    } catch (err) {
      toast.error('Gagal mengirim laporan.');
    }
  };

  const healthByPeriod = useMemo(() => {
    if (!data?.health) return [];
    return data.health.map(item => ({
      periode: item.periode,
      kasus: item.kasus,
      vaksinasi: item.vaksinasi,
      penyakit: item.penyakit,
    }));
  }, [data]);

  const umkmStats = useMemo(() => {
    if (!data?.umkm) return [];
    const grouped = data.umkm.reduce((acc, item) => {
      const row = acc[item.kategori] || { kategori: item.kategori, omzet: 0, tenaga_kerja: 0, jumlah: 0 };
      row.omzet += item.omzet_bulanan;
      row.tenaga_kerja += item.tenaga_kerja;
      row.jumlah += 1;
      acc[item.kategori] = row;
      return acc;
    }, {});
    return Object.values(grouped);
  }, [data]);

  const activeAlerts = data?.alerts?.filter(alert => alert.aktif) || [];

  const toggleAlert = async (alert) => {
    try {
      await api.patch(`/public-services/alerts/${alert.id}`, { aktif: !alert.aktif });
      await load();
      setMessage('Status alert diperbarui.');
      window.setTimeout(() => setMessage(''), 2500);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Hanya admin yang bisa mengubah alert.');
    }
  };

  if (loading) {
    return <Layout title="Layanan Publik" ><div className="pub-loading">Memuat data...</div></Layout>;
  }

  return (
    <Layout title="Portal Layanan Publik Kota Medan" subtitle="Integrasi data fasilitas, cctv, pendidikan, dan peluang karir lokal.">
      {activeAlerts.map(alert => (
        <div className={`pub-alert ${alert.tingkat.toLowerCase()}`} key={alert.id}>
          <strong>{alert.tingkat}: {alert.judul}</strong>
          <span>{alert.pesan}</span>
        </div>
      ))}
      {message && <div className="pub-message">{message}</div>}

      <div className="pub-tabs">
        {tabs.map(([id, label]) => (
          <button key={id} type="button" className={active === id ? 'active' : ''} onClick={() => setActive(id)}>{label}</button>
        ))}
      </div>

      {active === 'rs' && (
        <section className="pub-split">
          <div className="pub-panel">
            <div className="pub-head"><h2>Info Kapasitas Rumah Sakit</h2><span>Bed tersedia dan status layanan</span></div>
            <div className="pub-list">
              {data.hospitals.map(rs => (
                <article className="pub-card" key={rs.id}>
                  <div>
                    <strong>{rs.nama}</strong>
                    <p>{rs.alamat}</p>
                  </div>
                  <span className={`pub-status ${rs.status.toLowerCase()}`}>{rs.bed_tersedia}/{rs.bed_total} bed · {rs.status}</span>
                </article>
              ))}
            </div>
          </div>
          <div className="pub-panel">
            <MapBox points={data.hospitals} type="hospital" />
          </div>
        </section>
      )}

      {active === 'cctv' && (
        <section className="pub-panel pub-cctv-panel">
          <div className="pub-cctv-head">
            <div>
              <span className="pub-cctv-label">Sumber resmi Dishub Kota Medan</span>
              <h2>CCTV ATCS Kota Medan</h2>
              <p>Cuplikan kamera dan akses livestream resmi untuk pemantauan lalu lintas Kota Medan.</p>
            </div>
            <a className="pub-cctv-link" href={ATCS_STREAM_URL} target="_blank" rel="noreferrer">
              Lihat Semua CCTV
            </a>
          </div>

          <div className="pub-cctv-grid">
            {OFFICIAL_CCTV_CAMERAS.map(camera => (
              <article className="pub-cctv-card" key={camera.nama}>
                <img src={camera.poster} alt={`Cuplikan CCTV ${camera.nama}`} loading="lazy" />
                <div className="pub-cctv-card-body">
                  <span className="pub-cctv-live">ATCS Medan</span>
                  <h3>{camera.nama}</h3>
                  <p>{camera.lokasi}</p>
                  <a href={camera.stream || ATCS_STREAM_URL} target="_blank" rel="noreferrer">
                    {camera.stream ? 'Buka Livestream' : 'Pilih Kamera di ATCS'}
                  </a>
                </div>
              </article>
            ))}
          </div>

          <p className="pub-cctv-note">
            Livestream dibuka melalui <a href={ATCS_STREAM_URL} target="_blank" rel="noreferrer">ATCS Dishub Kota Medan</a>.
            Situs resmi membatasi penayangan video di domain lain, sehingga player dibuka pada halaman ATCS agar siaran tetap berjalan dengan benar.
          </p>
        </section>
      )}

      {active === 'alert' && (
        <section className="pub-grid">
          {data.alerts.map(alert => (
            <article className="pub-panel" key={alert.id}>
              <div className="pub-head"><h2>{alert.judul}</h2><span>{alert.tingkat}</span></div>
              <p>{alert.pesan}</p>
              <span className={`pub-status ${alert.aktif ? 'aktif' : 'nonaktif'}`}>{alert.aktif ? 'Aktif' : 'Nonaktif'}</span>
              {user?.role === 'admin' && <button className="pub-primary" onClick={() => toggleAlert(alert)}>{alert.aktif ? 'Nonaktifkan' : 'Aktifkan'}</button>}
            </article>
          ))}
        </section>
      )}

      {active === 'health' && (
        <section className="pub-panel">
          <div className="pub-head"><h2>Statistik Kesehatan Kota</h2><span>Penyakit dan vaksinasi per periode</span></div>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={healthByPeriod}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDF0F7" />
              <XAxis dataKey="periode" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="kasus" name="Kasus Penyakit" fill={RED} radius={[6, 6, 0, 0]} />
              <Bar dataKey="vaksinasi" name="Vaksinasi" fill={GOLD} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="pub-chip-row">
            {data.health.map(item => <span key={item.id}>{item.periode}: {item.penyakit}</span>)}
          </div>
        </section>
      )}

      {active === 'edu' && (
        <section className="pub-split">
          <div className="pub-panel">
            <div className="pub-head"><h2>Direktori Sekolah & Universitas</h2><span>Institusi pendidikan dan lokasi</span></div>
            <div className="pub-list">
              {data.education.map(item => (
                <article className="pub-card" key={item.id}>
                  <strong>{item.nama}</strong>
                  <p>{item.alamat}</p>
                  <span>{item.jenis} · Akreditasi {item.akreditasi} · {Number(item.jumlah_siswa).toLocaleString('id-ID')} peserta didik</span>
                </article>
              ))}
            </div>
          </div>
          <div className="pub-panel"><MapBox points={data.education} type="education" /></div>
        </section>
      )}

      {active === 'jobs' && (
        <section className="pub-job-section">
          <div className="pub-job-bar">
            <div className="pub-job-filters">
              <input 
                type="text" 
                placeholder="Cari posisi atau perusahaan..." 
                value={jobSearch}
                onChange={e => setJobSearch(e.target.value)}
                className="pub-job-input"
              />
              <select value={jobCategory} onChange={e => setJobCategory(e.target.value)} className="pub-job-select">
                <option value="Semua">Semua Kategori</option>
                <option value="Teknologi">Teknologi</option>
                <option value="Kesehatan">Kesehatan</option>
                <option value="UMKM">UMKM</option>
                <option value="Jasa">Jasa</option>
                <option value="Umum">Umum</option>
              </select>
              <select value={jobType} onChange={e => setJobType(e.target.value)} className="pub-job-select">
                <option value="Semua">Semua Tipe</option>
                <option value="Full-time">Full-time</option>
                <option value="Contract">Contract</option>
                <option value="Part-time">Part-time</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>
            <button type="button" className="pub-primary pub-add-job-btn" onClick={() => setShowJobModal(true)}>
              + Pasang Lowongan
            </button>
          </div>

          <div className="pub-grid">
            {filteredJobs.length === 0 ? (
              <div className="pub-no-jobs">Tidak ada lowongan pekerjaan yang cocok dengan pencarian Anda.</div>
            ) : (
              filteredJobs.map(job => (
                <article className="pub-card pub-job" key={job.id}>
                  <div className="pub-job-head">
                    <span className="pub-job-badge">{job.kategori || 'Umum'}</span>
                    <span className="pub-job-type">{job.lokasi} · {job.tipe}</span>
                  </div>
                  <strong>{job.posisi}</strong>
                  <p className="pub-job-company">{job.perusahaan}</p>
                  <p className="pub-job-desc">{job.deskripsi}</p>
                  <div className="pub-job-foot">
                    <span className="pub-job-salary">{job.gaji}</span>
                    <div className="pub-job-actions">
                      <button type="button" className="pub-btn-detail" onClick={() => setSelectedJob(job)}>Detail</button>
                      <button type="button" className="pub-btn-report" title="Laporkan Lowongan" onClick={() => handleReportJob(job.id)}>Lapor</button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          {selectedJob && (
            <div className="pub-modal-overlay" onClick={() => setSelectedJob(null)}>
              <div className="pub-modal-content" onClick={e => e.stopPropagation()}>
                <div className="pub-modal-head">
                  <h2>{selectedJob.posisi}</h2>
                  <button type="button" className="pub-modal-close" onClick={() => setSelectedJob(null)}>&times;</button>
                </div>
                <div className="pub-modal-body">
                  <p><strong>Perusahaan:</strong> {selectedJob.perusahaan}</p>
                  <p><strong>Kategori:</strong> {selectedJob.kategori || 'Umum'}</p>
                  <p><strong>Lokasi:</strong> {selectedJob.lokasi}</p>
                  <p><strong>Tipe Pekerjaan:</strong> {selectedJob.tipe}</p>
                  <p><strong>Kisaran Gaji:</strong> {selectedJob.gaji}</p>
                  <p><strong>Batas Waktu:</strong> {selectedJob.deadline || 'Tidak ditentukan'}</p>
                  <hr />
                  <h4>Deskripsi Pekerjaan:</h4>
                  <p>{selectedJob.deskripsi || 'Tidak ada deskripsi rinci.'}</p>
                  <h4>Kualifikasi & Persyaratan:</h4>
                  <p>{selectedJob.persyaratan || 'Sesuai standar kualifikasi perusahaan.'}</p>
                  <hr />
                  <div className="pub-contact-box">
                    <strong>Kontak & Pendaftaran Resmi:</strong>
                    <p>{selectedJob.kontak || 'Hubungi instansi terkait.'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showJobModal && (
            <div className="pub-modal-overlay" onClick={() => setShowJobModal(false)}>
              <div className="pub-modal-content wide" onClick={e => e.stopPropagation()}>
                <div className="pub-modal-head">
                  <h2>Pasang Lowongan Pekerjaan Baru</h2>
                  <button type="button" className="pub-modal-close" onClick={() => setShowJobModal(false)}>&times;</button>
                </div>
                <form onSubmit={handleCreateJob} className="pub-job-form">
                  <div className="pub-form-grid">
                    <label>
                      <span>Posisi Pekerjaan *</span>
                      <input type="text" required placeholder="Contoh: Admin Kasir / Staff IT" value={newJob.posisi} onChange={e => setNewJob({...newJob, posisi: e.target.value})} />
                    </label>
                    <label>
                      <span>Nama Perusahaan / UMKM *</span>
                      <input type="text" required placeholder="Contoh: PT Medan Sejahtera / Toko Berkah" value={newJob.perusahaan} onChange={e => setNewJob({...newJob, perusahaan: e.target.value})} />
                    </label>
                    <label>
                      <span>Kategori *</span>
                      <select value={newJob.kategori} onChange={e => setNewJob({...newJob, kategori: e.target.value})}>
                        <option value="Teknologi">Teknologi</option>
                        <option value="Kesehatan">Kesehatan</option>
                        <option value="UMKM">UMKM</option>
                        <option value="Jasa">Jasa</option>
                        <option value="Umum">Umum</option>
                      </select>
                    </label>
                    <label>
                      <span>Lokasi Kecamatan *</span>
                      <input type="text" required placeholder="Contoh: Medan Petisah" value={newJob.lokasi} onChange={e => setNewJob({...newJob, lokasi: e.target.value})} />
                    </label>
                    <label>
                      <span>Tipe Pekerjaan</span>
                      <select value={newJob.tipe} onChange={e => setNewJob({...newJob, tipe: e.target.value})}>
                        <option value="Full-time">Full-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Freelance">Freelance</option>
                      </select>
                    </label>
                    <label>
                      <span>Kisaran Gaji</span>
                      <input type="text" placeholder="Contoh: Rp 3 - 5 Juta" value={newJob.gaji} onChange={e => setNewJob({...newJob, gaji: e.target.value})} />
                    </label>
                    <label>
                      <span>Kontak / Cara Melamar *</span>
                      <input type="text" required placeholder="Email / WA / Link Pendaftaran" value={newJob.kontak} onChange={e => setNewJob({...newJob, kontak: e.target.value})} />
                    </label>
                    <label>
                      <span>Batas Waktu (Deadline)</span>
                      <input type="date" value={newJob.deadline} onChange={e => setNewJob({...newJob, deadline: e.target.value})} />
                    </label>
                  </div>
                  <label className="full">
                    <span>Deskripsi Pekerjaan</span>
                    <textarea rows={3} placeholder="Jelaskan tanggung jawab utama pekerjaan..." value={newJob.deskripsi} onChange={e => setNewJob({...newJob, deskripsi: e.target.value})}></textarea>
                  </label>
                  <label className="full">
                    <span>Kualifikasi & Persyaratan</span>
                    <textarea rows={3} placeholder="Tuliskan syarat pendidikan, pengalaman, dan keahlian..." value={newJob.persyaratan} onChange={e => setNewJob({...newJob, persyaratan: e.target.value})}></textarea>
                  </label>
                  <div className="pub-form-actions">
                    <button type="button" onClick={() => setShowJobModal(false)}>Batal</button>
                    <button type="submit" className="pub-primary" disabled={submittingJob}>{submittingJob ? 'Mengirim...' : 'Kirim Lowongan'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </section>
      )}

      {active === 'umkm' && (
        <section className="pub-split wide">
          <div className="pub-panel">
            <div className="pub-head"><h2>Data UMKM & Ekonomi Lokal</h2><span>Sebaran usaha dan statistik ekonomi</span></div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={umkmStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EDF0F7" />
                <XAxis dataKey="kategori" />
                <YAxis tickFormatter={value => `${value / 1000000} jt`} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="omzet" name="Omzet Bulanan" stroke={GOLD} strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={umkmStats} dataKey="jumlah" nameKey="kategori" outerRadius={80} label>
                  {umkmStats.map((item, index) => <Cell key={item.kategori} fill={[GOLD, BLUE, PURPLE, GOLD_LIGHT][index % 4]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="pub-panel"><MapBox points={data.umkm} type="umkm" /></div>
        </section>
      )}
    </Layout>
  );
}

function MapBox({ points, type, showZones = false }) {
  return (
    <div className="pub-map">
      <MapContainer center={[3.5896, 98.6739]} zoom={12} style={{ width: '100%', height: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="OpenStreetMap" />
        {showZones && (
          <>
            <Circle center={[3.5908, 98.6693]} radius={900} pathOptions={{ color: GOLD, fillColor: GOLD, fillOpacity: 0.12 }} />
            <Circle center={[3.5700, 98.6350]} radius={1000} pathOptions={{ color: BLUE, fillColor: BLUE, fillOpacity: 0.10 }} />
          </>
        )}
        {points.map(point => (
          <Marker key={`${type}-${point.id}`} position={[point.lat, point.lng]}>
            <Popup>
              <strong>{point.nama}</strong><br />
              {point.alamat || point.lokasi}<br />
              {point.status || point.kategori || point.jenis}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
