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
  ['voucher', 'Voucher & Poin'],
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
  const { user, setUser } = useAuth();
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

  // Vouchers state
  const [claimedVouchers, setClaimedVouchers] = useState([]);
  
  // Shopping Cart POS State
  const [cart, setCart] = useState([]);
  const [selectedVouchers, setSelectedVouchers] = useState([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptDetails, setReceiptDetails] = useState(null);
  
  const UMKM_PRODUCTS = useMemo(() => [
    { id: 1, nama: 'Kopi Gayo Arabica Kesawan', merchant: 'Kopi Kesawan', harga: 45000, gambar: '☕' },
    { id: 2, nama: 'Bolu Gulung Meranti Keju', merchant: 'Kue Medan', harga: 85000, gambar: '🍰' },
    { id: 3, nama: 'Bika Ambon Mini Zulaikha', merchant: 'Kue Medan', harga: 65000, gambar: '🍮' },
    { id: 4, nama: 'Batik Deli Selendang Sutra', merchant: 'Batik Deli', harga: 125000, gambar: '🧣' },
    { id: 5, nama: 'Keripik Amplas Renyah Tenggiri', merchant: 'Keripik Amplas', harga: 25000, gambar: '🐟' },
    { id: 6, nama: 'Gantungan Kunci Kulit Craft', merchant: 'Craft Sunggal', harga: 15000, gambar: '🔑' },
  ], []);

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
    
    try {
      const uRes = await api.get('/users/profil');
      setUser(uRes.data);
      localStorage.setItem('user', JSON.stringify(uRes.data));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load().catch(() => setMessage('Gagal memuat data layanan publik.')).finally(() => setLoading(false));
  }, []);

  const handleAddToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
    toast.success(`${product.nama} dimasukkan ke keranjang!`);
  };

  const handleUpdateQuantity = (productId, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const nextQty = item.quantity + delta;
          return nextQty > 0 ? { ...item, quantity: nextQty } : item;
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const handleRemoveFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
    toast.success('Produk dihapus dari keranjang.');
  };

  const handleToggleVoucher = (voucherCode) => {
    setSelectedVouchers(prev => {
      if (prev.includes(voucherCode)) {
        return prev.filter(code => code !== voucherCode);
      }
      return [...prev, voucherCode];
    });
  };

  const cartSummary = useMemo(() => {
    const subtotal = cart.reduce((acc, item) => acc + (item.product.harga * item.quantity), 0);
    
    let discountPercent = 0;
    let discountNominal = 0;
    let ongkir = 10000;

    selectedVouchers.forEach(code => {
      if (code === 'MEDAN-EBATIK-20') {
        discountPercent = 0.20;
      } else if (code === 'MEDAN-KULINER-15') {
        discountNominal = 15000;
      } else if (code === 'MEDAN-TRANS-FREE') {
        ongkir = 0;
      }
    });

    const percentDiscount = Math.round(subtotal * discountPercent);
    const totalDiscount = percentDiscount + discountNominal;
    const rawTotalPay = subtotal - totalDiscount + ongkir;
    const totalPay = Math.max(0, rawTotalPay);
    const pointsEarned = Math.round(totalPay / 2000);

    return {
      subtotal,
      percentDiscount,
      discountNominal,
      ongkir,
      totalDiscount,
      totalPay,
      pointsEarned
    };
  }, [cart, selectedVouchers]);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    const summary = cartSummary;
    try {
      const res = await api.post('/users/points/add', {
        amount: summary.pointsEarned,
        actionDetail: `Mendapatkan cashback poin dari simulasi pembelian produk UMKM.`
      });

      if (res.data.success) {
        setUser({ ...user, poin: res.data.poin });
        localStorage.setItem('user', JSON.stringify({ ...user, poin: res.data.poin }));
        setReceiptDetails({
          items: [...cart],
          summary,
          vouchers: [...selectedVouchers],
          newBalance: res.data.poin
        });
        setShowReceipt(true);
        setCart([]);
        setSelectedVouchers([]);
        toast.success('Transaksi POS berhasil diproses!');
      }
    } catch (e) {
      toast.error('Gagal memproses transaksi.');
    }
  };

  const handleClaimVoucher = async (voucher) => {
    try {
      const res = await api.post('/users/vouchers/claim', { voucherId: voucher.id });
      if (res.data.success) {
        toast.success(res.data.message);
        setUser({ ...user, poin: res.data.poin });
        localStorage.setItem('user', JSON.stringify({ ...user, poin: res.data.poin }));
        if (!claimedVouchers.some(v => v.kode === voucher.kode)) {
          setClaimedVouchers([...claimedVouchers, voucher]);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Poin Anda tidak mencukupi.');
    }
  };

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
        <>
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

          {/* POS & shopping cart section */}
          <section className="pub-panel wide" style={{ marginTop: 24 }}>
            <div className="pub-head" style={{ borderBottom: '1px solid #edf0f7', paddingBottom: 16, marginBottom: 20 }}>
              <div>
                <h2>🛒 Simulasi Kasir & Pembelian Produk UMKM (POS)</h2>
                <span>Pilih produk dari UMKM terdaftar, tambahkan ke keranjang, dan gunakan voucher diskon stackable Anda!</span>
              </div>
              <span className="pub-badge gold">💰 {user?.poin !== undefined ? user.poin : 450} Poin Anda</span>
            </div>

            <div className="pub-split wide" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24 }}>
              {/* Product grid list */}
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#111e43', marginBottom: 14 }}>Daftar Produk Master UMKM</h3>
                <div className="pub-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                  {UMKM_PRODUCTS.map(p => (
                    <div key={p.id} className="pub-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 16 }}>
                      <div style={{ fontSize: 36, textAlign: 'center', margin: '10px 0' }}>{p.gambar}</div>
                      <h4 style={{ fontSize: 13, fontWeight: 800, color: '#202224', margin: '6px 0 2px' }}>{p.nama}</h4>
                      <span style={{ fontSize: 11, color: '#7b8190', fontWeight: 600 }}>{p.merchant}</span>
                      <strong style={{ fontSize: 14, color: '#043cb1', marginTop: 10, display: 'block' }}>
                        Rp {p.harga.toLocaleString('id-ID')}
                      </strong>
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ marginTop: 'auto', width: '100%', fontSize: 11, padding: '8px 10px', borderRadius: 10, display: 'block', textAlign: 'center' }}
                        onClick={() => handleAddToCart(p)}
                      >
                        + Keranjang
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shopping Cart & Voucher Application */}
              <div className="pub-card" style={{ border: '1px solid #edf0f7', display: 'flex', flexDirection: 'column', gap: 16, background: '#f8faff', padding: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#111e43', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Keranjang Belanja</span>
                  <span style={{ fontSize: 12, color: '#7b8190' }}>({cart.length} item)</span>
                </h3>

                {cart.length === 0 ? (
                  <div style={{ padding: '40px 0', textAlign: 'center', color: '#7b8190', fontSize: 12, fontWeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                    <span>🛒 Keranjang belanja Anda masih kosong.</span>
                  </div>
                ) : (
                  <>
                    {/* Cart Items List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 180, overflowY: 'auto', paddingRight: 4 }}>
                      {cart.map(item => (
                        <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, background: '#ffffff', padding: 10, borderRadius: 10, border: '1px solid #edf0f7' }}>
                          <span style={{ fontSize: 20 }}>{item.product.gambar}</span>
                          <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                            <h5 style={{ fontSize: 12, fontWeight: 800, color: '#202224', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product.nama}</h5>
                            <span style={{ fontSize: 10, color: '#7b8190' }}>Rp {item.product.harga.toLocaleString('id-ID')}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <button type="button" style={{ width: 22, height: 22, border: '1px solid #edf0f7', borderRadius: 4, background: '#ffffff', display: 'grid', placeItems: 'center', fontWeight: 'bold' }} onClick={() => handleUpdateQuantity(item.product.id, -1)}>-</button>
                            <span style={{ fontSize: 12, fontWeight: 800 }}>{item.quantity}</span>
                            <button type="button" style={{ width: 22, height: 22, border: '1px solid #edf0f7', borderRadius: 4, background: '#ffffff', display: 'grid', placeItems: 'center', fontWeight: 'bold' }} onClick={() => handleUpdateQuantity(item.product.id, 1)}>+</button>
                            <button type="button" style={{ border: 0, background: 'transparent', color: '#ff4d6d', marginLeft: 4, cursor: 'pointer' }} onClick={() => handleRemoveFromCart(item.product.id)}>
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Vouchers Checklist (Stackable Discounts) */}
                    <div style={{ borderTop: '1px solid #edf0f7', paddingTop: 12 }}>
                      <h4 style={{ fontSize: 12, fontWeight: 800, color: '#111e43', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                        <span>Pilih Voucher Diskon (Stackable)</span>
                      </h4>
                      {claimedVouchers.length === 0 ? (
                        <div style={{ fontSize: 11, color: '#7b8190', padding: '6px 0', textAlign: 'left' }}>
                          Anda belum mengklaim voucher apa pun di tab <strong>Voucher & Poin</strong>.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {claimedVouchers.map(v => (
                            <label key={v.kode} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 11, background: '#ffffff', padding: 8, borderRadius: 8, border: '1.5px solid #edf0f7', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                style={{ marginTop: 2 }}
                                checked={selectedVouchers.includes(v.kode)}
                                onChange={() => handleToggleVoucher(v.kode)}
                              />
                              <div style={{ textAlign: 'left' }}>
                                <strong style={{ color: '#043cb1', display: 'block' }}>{v.kode}</strong>
                                <span style={{ color: '#5f687c' }}>{v.nama} ({v.potongan})</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Summary Calculation */}
                    <div style={{ borderTop: '1px solid #edf0f7', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, textAlign: 'left' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Subtotal Belanja:</span>
                        <strong>Rp {cartSummary.subtotal.toLocaleString('id-ID')}</strong>
                      </div>
                      {cartSummary.percentDiscount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#27c98b' }}>
                          <span>Diskon Voucher 20%:</span>
                          <span>-Rp {cartSummary.percentDiscount.toLocaleString('id-ID')}</span>
                        </div>
                      )}
                      {cartSummary.discountNominal > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#27c98b' }}>
                          <span>Subsidi Kuliner:</span>
                          <span>-Rp {cartSummary.discountNominal.toLocaleString('id-ID')}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Biaya Pengiriman:</span>
                        <span>{cartSummary.ongkir > 0 ? `Rp ${cartSummary.ongkir.toLocaleString('id-ID')}` : 'GRATIS (Voucher)'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #edf0f7', paddingTop: 8, fontSize: 14, fontWeight: 900, color: '#111e43' }}>
                        <span>Total Pembayaran:</span>
                        <span>Rp {cartSummary.totalPay.toLocaleString('id-ID')}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a9742e', fontSize: 11, fontWeight: 800, marginTop: 4, background: '#fff8ec', padding: '6px 10px', borderRadius: 6 }}>
                        <span>Cashback Poin (+5%):</span>
                        <span>💰 +{cartSummary.pointsEarned} Poin</span>
                      </div>
                    </div>

                    {/* Pay Button */}
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ width: '100%', justifyContent: 'center', fontWeight: 800, borderRadius: 12, padding: '10px' }}
                      onClick={handleCheckout}
                    >
                      Bayar Sekarang (Simulasi)
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>
        </>
      )}

      {active === 'voucher' && (
        <section className="pub-panel wide">
          <div className="pub-head">
            <div>
              <h2>🎁 Dompet Voucher & Poin Warga Medan</h2>
              <span>Tukarkan poin keaktifan warga dengan voucher diskon UMKM & layanan publik kota</span>
            </div>
            <span className="pub-badge gold">💰 {user?.poin !== undefined ? user.poin : 450} Poin Warga</span>
          </div>

          <div className="pub-grid">
            {(data.vouchers || []).map((v) => {
              const isClaimed = claimedVouchers.some(cv => cv.kode === v.kode);
              return (
                <div key={v.id} className="pub-card">
                  <div className="pub-card-head">
                    <span className="pub-tag gold">{v.kategori}</span>
                    <span className="pub-badge">{v.potongan}</span>
                  </div>
                  <h3>{v.nama}</h3>
                  <p>{v.deskripsi}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTop: '1px solid #edf0f7' }}>
                    <span style={{ fontSize: 12, color: '#7b8190', fontWeight: 700 }}>Poin: <strong style={{ color: '#043cb1' }}>{v.poin_biaya} Poin</strong></span>
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ padding: '6px 14px', fontSize: 12, borderRadius: 20 }}
                      disabled={isClaimed}
                      onClick={() => handleClaimVoucher(v)}
                    >
                      {isClaimed ? 'Sudah Diklaim' : 'Klaim Voucher'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Receipt Modal Dialog Backdrop */}
      {showReceipt && receiptDetails && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(17, 30, 67, 0.4)', backdropFilter: 'blur(8px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="pub-card" style={{ width: '100%', maxWidth: 400, background: '#ffffff', borderRadius: 20, boxShadow: '0 24px 60px rgba(17,30,67,0.25)', padding: 24, textAlign: 'center', border: '1.5px solid #edf0f7' }}>
            <span style={{ fontSize: 48 }}>🧾</span>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: '#111e43', margin: '12px 0 4px' }}>Struk Pembelian POS UMKM</h2>
            <span style={{ fontSize: 11, color: '#7b8190', display: 'block', marginBottom: 18 }}>Medan Smart City Portal - Lunas</span>
            
            {/* Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px dashed #e4e8f1', borderBottom: '1px dashed #e4e8f1', padding: '12px 0', margin: '12px 0', fontSize: 12, textAlign: 'left' }}>
              {receiptDetails.items.map(item => (
                <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#5f687c' }}>{item.product.nama} x{item.quantity}</span>
                  <strong>Rp {(item.product.harga * item.quantity).toLocaleString('id-ID')}</strong>
                </div>
              ))}
            </div>

            {/* Calculations breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, textAlign: 'left', borderBottom: '1px solid #edf0f7', paddingBottom: 12, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal:</span>
                <span>Rp {receiptDetails.summary.subtotal.toLocaleString('id-ID')}</span>
              </div>
              {receiptDetails.vouchers.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#27c98b' }}>
                  <span>Voucher Digunakan:</span>
                  <strong>{receiptDetails.vouchers.join(', ')}</strong>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#27c98b' }}>
                <span>Total Potongan Diskon:</span>
                <span>-Rp {receiptDetails.summary.totalDiscount.toLocaleString('id-ID')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Ongkir:</span>
                <span>Rp {receiptDetails.summary.ongkir.toLocaleString('id-ID')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 900, color: '#111e43', marginTop: 4 }}>
                <span>Total Bayar:</span>
                <span>Rp {receiptDetails.summary.totalPay.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Points Earned */}
            <div style={{ background: '#fff8ec', borderRadius: 10, padding: 12, marginBottom: 20, textAlign: 'left', fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a9742e', fontWeight: 800 }}>
                <span>Cashback Diperoleh:</span>
                <span>💰 +{receiptDetails.summary.pointsEarned} Poin</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#5f687c', marginTop: 4, fontSize: 11 }}>
                <span>Saldo Poin Sekarang:</span>
                <strong>💰 {receiptDetails.newBalance} Poin</strong>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', borderRadius: 12 }}
              onClick={() => setShowReceipt(false)}
            >
              Selesai & Tutup
            </button>
          </div>
        </div>
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
