import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import HeroIcon from '../../components/HeroIcon';
import './LayananPage.css';

const serviceCategories = [
  {
    id: 'pemerintahan',
    title: 'Pemerintahan & Tata Kelola Kota',
    subtitle: 'Layanan partisipasi publik, pengaduan masalah warga, dan transparansi kebijakan kota.',
    badge: 'Smart Governance',
    items: [
      {
        to: '/layanan-kota',
        icon: 'government',
        title: 'Layanan Kota & Pengaduan',
        tag: 'E-Government & Laporan',
        desc: 'Portal pengajuan pengaduan warga (infrastruktur, kebersihan, fasilitas), voting kebijakan publik kota, serta transparansi pengumuman pemerintah.',
      },
    ],
  },
  {
    id: 'fasilitas',
    title: 'Fasilitas Publik & Pemberdayaan Masyarakat',
    subtitle: 'Akses terpadu fasilitas kesehatan, pendidikan, karir lokal, dan ekonomi UMKM.',
    badge: 'Smart Living & Economy',
    items: [
      {
        to: '/layanan-publik',
        icon: 'sparkles',
        title: 'Layanan Publik Terpadu',
        tag: 'Fasilitas & Karir Lokal',
        desc: 'Informasi realtime kapasitas tempat tidur rumah sakit, streaming CCTV ATCS, data pendidikan, bursa lowongan kerja warga terverifikasi, dan direktori UMKM.',
      },
    ],
  },
];

export default function LayananPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredCategories = serviceCategories.filter(
    (cat) => selectedCategory === 'all' || cat.id === selectedCategory
  );

  return (
    <Layout
      title="Pusat Layanan Digital Kota Medan"
      subtitle="Pilih kategori layanan digital kota untuk mengakses pengaduan warga, kebijakan, dan fasilitas publik."
    >
      <div className="lay-uniqlo-filter-bar">
        <button
          type="button"
          className={`lay-uniqlo-pill ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          Semua Layanan
        </button>
        <button
          type="button"
          className={`lay-uniqlo-pill ${selectedCategory === 'pemerintahan' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('pemerintahan')}
        >
          Pemerintahan & Tata Kelola ▾
        </button>
        <button
          type="button"
          className={`lay-uniqlo-pill ${selectedCategory === 'fasilitas' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('fasilitas')}
        >
          Fasilitas & Karir Publik ▾
        </button>
      </div>

      <div className="lay-hub">
        {filteredCategories.map((cat) => (
          <section className="lay-section" key={cat.id}>
            <div className="lay-section-head">
              <div>
                <span className="lay-badge">{cat.badge}</span>
                <h2>{cat.title}</h2>
                <p>{cat.subtitle}</p>
              </div>
            </div>
            <div className="lay-grid">
              {cat.items.map((item) => (
                <article className="lay-card" key={item.to}>
                  <div className="lay-card-head">
                    <span className="lay-icon"><HeroIcon name={item.icon} /></span>
                    <span className="lay-tag">{item.tag}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                  <Link to={item.to} className="lay-link">
                    <span>Buka Layanan</span>
                    <HeroIcon name="arrowUpRight" />
                  </Link>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </Layout>
  );
}
