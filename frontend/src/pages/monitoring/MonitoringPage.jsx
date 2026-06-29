import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import HeroIcon from '../../components/HeroIcon';
import './MonitoringPage.css';

const categories = [
  {
    id: 'mobilitas',
    title: 'Mobilitas & Peta Digital',
    subtitle: 'Sistem pemantauan geospasial, arus lalu lintas, dan moda transportasi publik kota.',
    badge: 'Realtime GPS & ATCS',
    items: [
      {
        to: '/peta',
        icon: 'map',
        title: 'Peta Interaktif',
        tag: 'Geospasial GIS',
        desc: 'Visualisasi peta wilayah Kota Medan dengan layer interaktif fasilitas publik, titik evakuasi bencana, dan zonasi wilayah.',
      },
      {
        to: '/lalu-lintas',
        icon: 'road',
        title: 'Lalu Lintas & CCTV',
        tag: 'ATCS Dishub Live',
        desc: 'Pantauan streaming CCTV persimpangan jalan utama, titik kemacetan, serta status operasional lalu lintas kota secara realtime.',
      },
      {
        to: '/transportasi',
        icon: 'truck',
        title: 'Transportasi Umum',
        tag: 'Rute Bus & Angkot',
        desc: 'Informasi lengkap koridor rute transportasi publik, lokasi terminal, jam operasional, dan tarif perjalanan warga.',
      },
    ],
  },
  {
    id: 'lingkungan',
    title: 'Lingkungan Hidup & Keberlanjutan',
    subtitle: 'Pemantauan kualitas udara, distribusi air bersih, dan manajemen kebersihan lingkungan.',
    badge: 'IoT Sensors',
    items: [
      {
        to: '/udara',
        icon: 'cloud',
        title: 'Kualitas Udara',
        tag: 'Indeks AQI',
        desc: 'Monitoring indeks kualitas udara (ISPU/AQI) kota, kadar polutan PM2.5, serta tren emisi udara harian secara presisi.',
      },
      {
        to: '/air-bersih',
        icon: 'water',
        title: 'Air Bersih',
        tag: 'PDAM & Water Quality',
        desc: 'Status jaringan distribusi air bersih, tekanan pasokan pipa kota, serta laporan kualitas air untuk konsumsi warga.',
      },
      {
        to: '/sampah',
        icon: 'trash',
        title: 'Pengelolaan Sampah',
        tag: 'Sanitasi Kota',
        desc: 'Jadwal pengangkutan sampah wilayah, pemantauan armada truk kebersihan, dan titik lokasi TPS/Bank Sampah.',
      },
    ],
  },
  {
    id: 'infrastruktur',
    title: 'Infrastruktur & Energi',
    subtitle: 'Manajemen konsumsi daya kota dan penerangan jalan umum terpadu.',
    badge: 'Smart Grid',
    items: [
      {
        to: '/energi',
        icon: 'energy',
        title: 'Monitoring Energi',
        tag: 'PJU & Power Grid',
        desc: 'Statistik konsumsi daya listrik kota, efisiensi penerangan jalan umum (PJU), dan integrasi jaringan energi terbarukan.',
      },
    ],
  },
];

export default function MonitoringPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredCategories = categories.filter(
    (cat) => selectedCategory === 'all' || cat.id === selectedCategory
  );

  return (
    <Layout
      title="Pusat Monitoring Smart City Medan"
      subtitle="Pilih kategori sistem pemantauan kota terpadu untuk melihat data dan informasi realtime."
    >
      <div className="mon-uniqlo-filter-bar">
        <button
          type="button"
          className={`mon-uniqlo-pill ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          Semua Kategori
        </button>
        <button
          type="button"
          className={`mon-uniqlo-pill ${selectedCategory === 'mobilitas' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('mobilitas')}
        >
          Mobilitas & Peta ▾
        </button>
        <button
          type="button"
          className={`mon-uniqlo-pill ${selectedCategory === 'lingkungan' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('lingkungan')}
        >
          Lingkungan Kota ▾
        </button>
        <button
          type="button"
          className={`mon-uniqlo-pill ${selectedCategory === 'infrastruktur' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('infrastruktur')}
        >
          Infrastruktur & Energi ▾
        </button>
      </div>

      <div className="mon-hub">
        {filteredCategories.map((cat) => (
          <section className="mon-section" key={cat.id}>
            <div className="mon-section-head">
              <div>
                <span className="mon-badge">{cat.badge}</span>
                <h2>{cat.title}</h2>
                <p>{cat.subtitle}</p>
              </div>
            </div>
            <div className="mon-grid">
              {cat.items.map((item) => (
                <article className="mon-card" key={item.to}>
                  <div className="mon-card-head">
                    <span className="mon-icon"><HeroIcon name={item.icon} /></span>
                    <span className="mon-tag">{item.tag}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                  <Link to={item.to} className="mon-link">
                    <span>Buka Monitoring</span>
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
