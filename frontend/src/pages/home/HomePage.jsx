import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from '../../components/BrandLogo';
import HeroIcon from '../../components/HeroIcon';
import './HomePage.css';

const services = [
  {
    icon: 'government',
    title: 'Smart Governance',
    text: 'Layanan publik, laporan warga, dan panel admin untuk tata kelola kota yang responsif.',
  },
  {
    icon: 'truck',
    title: 'Smart Mobility',
    text: 'Pantau lalu lintas, transportasi, dan peta kota agar mobilitas warga lebih terarah.',
  },
  {
    icon: 'health',
    title: 'Smart Living',
    text: 'Akses fasilitas publik, zona aman, layanan kesehatan, pendidikan, dan informasi warga.',
  },
  {
    icon: 'sparkles',
    title: 'Smart Environment',
    text: 'Monitoring udara, air bersih, energi, dan sampah untuk lingkungan kota yang berkelanjutan.',
  },
];

const highlights = [
  'Dashboard Kota',
  'Laporan Warga',
  'OpenStreetMap',
  'Data Realtime',
  'Panel Admin',
  'Layanan Publik',
];

const stats = [
  { value: '25+', label: 'Fitur Kota' },
  { value: '12', label: 'Layanan Digital' },
  { value: '2', label: 'Database' },
];

const pillars = [
  'Smart Economy',
  'Smart People',
  'Smart Governance',
  'Smart Mobility',
  'Smart Environment',
  'Smart Living',
];

const hotNews = [
  {
    tag: '🔥 Lowongan Kerja Populer',
    title: 'Frontend Developer - Medan Digital Hub (Gaji Rp 6-9 Juta)',
    date: '29 Juni 2026',
    desc: 'Posisi paling diminati warga Medan pekan ini dengan 120+ pelamar terdaftar.',
    badge: 'Trending #1',
    link: '/layanan',
    icon: 'briefcase',
  },
  {
    tag: '🏥 Layanan Kesehatan',
    title: 'Kapasitas Bed RSUD Dr. Pirngadi Ditambah Realtime',
    date: '28 Juni 2026',
    desc: 'Sistem monitoring mencatat 42 tempat tidur baru siap melayani warga Medan.',
    badge: 'Update Terbaru',
    link: '/monitoring',
    icon: 'health',
  },
  {
    tag: '🌱 Lingkungan Kota',
    title: 'Kualitas Udara Medan Tersebar Dalam Kategori Baik (80 AQI)',
    date: '27 Juni 2026',
    desc: 'Sensor IoT mencatat tingkat polusi di zona pusat dan petisah berada dalam batas aman.',
    badge: 'Kondisi Baik',
    link: '/monitoring',
    icon: 'cloud',
  },
];

export default function HomePage() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const revealItems = Array.from(document.querySelectorAll('[data-reveal]'));
    if (!revealItems.length) return undefined;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -12% 0px',
      threshold: 0.15,
    });

    revealItems.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="home-page">
      <header className={`home-nav ${isScrolled ? 'is-scrolled' : ''}`}>
        <div className="home-container home-nav-inner">
          <Link className="home-brand" to="/">
            <BrandLogo compact />
          </Link>

          <nav className={`home-nav-links ${menuOpen ? 'open' : ''}`} aria-label="Navigasi utama">
            <a href="#layanan" onClick={closeMenu}>Layanan</a>
            <a href="#pilar" onClick={closeMenu}>Pilar Smart City</a>
            <a href="#about" onClick={closeMenu}>About Us</a>
            <a href="#demo" onClick={closeMenu}>Demo</a>
          </nav>

          <div className="home-nav-actions">
            {user ? (
              <Link to="/dashboard" className="home-button home-button-primary">Dashboard</Link>
            ) : (
              <Link to="/login" className="home-button home-button-primary">Login</Link>
            )}
            <button
              className={`home-menu-toggle ${menuOpen ? 'open' : ''}`}
              type="button"
              aria-label="Buka menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(open => !open)}
            >
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="home-hero">
          <div className="home-container hero-grid">
            <div className="hero-copy" data-reveal="fade-up">
              <span className="hero-badge">Transformasi Digital Medan</span>
              <h1>Membangun <span>Kota Pintar</span> untuk Warga Medan</h1>
              <p>
                Platform terpadu untuk memantau kondisi kota, mempercepat layanan publik,
                menerima laporan warga, dan membantu pengambilan keputusan berbasis data.
              </p>
              <div className="hero-actions">
                <Link to={user ? '/dashboard' : '/login'} className="home-button home-button-light home-button-large">
                  Mulai Gunakan
                </Link>
                <a href="#pilar" className="home-button home-button-ghost home-button-large">Pelajari Pilar</a>
              </div>
              <div className="hero-stats">
                {stats.map(item => (
                  <div key={item.label}>
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="hero-visual" aria-label="Ilustrasi fitur Smart City Medan" data-reveal="zoom-in">
              <div className="orbit-card orbit-card-main">
                <span className="city-icon"><HeroIcon name="city" /></span>
              </div>
              <div className="orbit-card orbit-card-blue"><HeroIcon name="cloud" /></div>
              <div className="orbit-card orbit-card-gold"><HeroIcon name="bolt" /></div>
              <div className="orbit-card orbit-card-navy"><HeroIcon name="home" /></div>
              <div className="orbit-ring"></div>
              <div className="hero-panel">
                <span>Status Sistem</span>
                <strong>Online</strong>
                <p>Data kota aktif dipantau dari satu portal.</p>
              </div>
            </div>
          </div>
          <div className="hero-wave" aria-hidden="true"></div>
        </section>

        <section id="layanan" className="home-section">
          <div className="home-container">
            <div className="section-heading" data-reveal="fade-up">
              <span>Layanan Utama</span>
              <h2>Solusi digital untuk warga dan pemerintah kota</h2>
            </div>
            <div className="service-grid">
              {services.map((service, index) => (
                <article className="service-card" key={service.title} data-reveal="fade-up" style={{ '--reveal-delay': `${index * 70}ms` }}>
                  <span className="service-icon"><HeroIcon name={service.icon} /></span>
                  <h3>{service.title}</h3>
                  <p>{service.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="hot-news" className="home-section hot-news-section">
          <div className="home-container">
            <div className="section-heading" data-reveal="fade-up">
              <span className="hot-news-kicker">⚡ Berita & Info Hangat</span>
              <h2>Hot News Kota Medan</h2>
            </div>
            <div className="hot-news-grid">
              {hotNews.map((news, index) => (
                <article className="hot-news-card" key={news.title} data-reveal="fade-up" style={{ '--reveal-delay': `${index * 80}ms` }}>
                  <div className="news-card-head">
                    <span className="news-tag">{news.tag}</span>
                    <span className="news-badge">{news.badge}</span>
                  </div>
                  <h3 className="news-title">{news.title}</h3>
                  <span className="news-date">📅 {news.date}</span>
                  <p className="news-desc">{news.desc}</p>
                  <Link to={news.link} className="news-link">Baca Selengkapnya →</Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="pilar" className="feature-band">
          <div className="home-container feature-grid">
            <div data-reveal="fade-up">
              <span className="section-kicker">Enam Pilar Utama</span>
              <h2>Fondasi Smart City yang terintegrasi dan berkelanjutan</h2>
              <p>
                Setiap fitur di portal ini dirancang untuk mendukung pilar kota pintar:
                layanan yang terbuka, mobilitas lancar, lingkungan sehat, dan warga yang aktif.
              </p>
            </div>
            <div className="feature-list">
              {pillars.map((item, index) => (
                <span key={item} data-reveal="fade-up" style={{ '--reveal-delay': `${index * 55}ms` }}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="home-section about-section">
          <div className="home-container about-grid">
            <div data-reveal="fade-up">
              <span className="section-kicker">About Us</span>
              <h2>Dibangun sebagai portal layanan kota digital yang modern.</h2>
              <p>
                Smart City Medan adalah project akademik yang dirancang untuk menampilkan
                bagaimana data kota, layanan warga, laporan publik, dan panel admin dapat
                dikelola dalam satu sistem terpadu.
              </p>
              <p>
                Fokus aplikasi ini adalah monitoring kota, partisipasi warga, transparansi
                kebijakan, dan pengelolaan layanan publik berbasis web.
              </p>
            </div>
            <div className="about-card" data-reveal="slide-left">
              <h3>Tim Pengembang</h3>
              <ul>
                <li>William Wiryawan</li>
                <li>Gillbert Allison Wijaya</li>
                <li>Dicky Sasqia</li>
                <li>Deidrich Zhu</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="demo" className="home-section demo-section">
          <div className="home-container demo-card" data-reveal="zoom-in">
            <div>
              <span>Siap Demo</span>
              <h2>Masuk untuk mencoba layanan Smart City Medan.</h2>
              <p>Untuk admin, gunakan akun dengan role admin agar menu Panel Admin terbuka.</p>
            </div>
            <Link to={user ? '/dashboard' : '/login'} className="home-button home-button-light home-button-large">
              {user ? 'Buka Dashboard' : 'Login / Guest Mode'}
            </Link>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <div className="home-container footer-grid">
          <div>
            <Link className="footer-brand" to="/">
              <BrandLogo compact variant="white" />
            </Link>
            <p>
              Portal digital untuk monitoring kota, layanan warga, informasi publik,
              dan administrasi smart city.
            </p>
          </div>
          <div>
            <h4>Navigasi</h4>
            <a href="#layanan">Layanan</a>
            <a href="#pilar">Pilar Smart City</a>
            <a href="#about">About Us</a>
            <Link to={user ? '/dashboard' : '/login'}>Dashboard</Link>
          </div>
          <div>
            <h4>Layanan</h4>
            <span>Monitoring Kota</span>
            <span>Laporan Warga</span>
            <span>Voting Kebijakan</span>
            <span>Panel Admin</span>
          </div>
          <div>
            <h4>Kontak</h4>
            <span>Medan, Indonesia</span>
            <span>smartcity@medan.local</span>
            <span>Senin - Jumat</span>
            <span>08:00 - 17:00 WIB</span>
          </div>
        </div>
        <div className="home-container footer-bottom">
          <span>© 2026 Smart City Medan. Project akademik.</span>
          <span>{highlights.slice(0, 4).join(' · ')}</span>
        </div>
      </footer>
    </div>
  );
}
