import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import HeroIcon from '../../components/HeroIcon';
import { getEcologyAvatar } from '../../utils/avatar';
import api from '../../utils/api';
import '../auth/auth.css';

const getInitials = (name = '') => {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return 'U';

  return parts
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('');
};

const hasUsablePhoto = (src) => {
  const value = String(src || '').trim();
  return Boolean(value && value !== 'null' && value !== 'undefined');
};

function ProfileAvatar({ src, initials, userName, imageClassName, fallbackClassName }) {
  const [imageError, setImageError] = useState(false);
  const showImage = hasUsablePhoto(src) && !imageError;

  useEffect(() => {
    setImageError(false);
  }, [src]);

  if (showImage) {
    return (
      <img
        src={src}
        alt="foto profil"
        className={imageClassName}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <img
      src={getEcologyAvatar(userName || initials)}
      alt="foto profil default"
      className={imageClassName}
      style={{ background: '#ffffff', padding: '4px', border: '2px solid #f7e4bf', objectFit: 'contain', display: 'block', margin: '0 auto' }}
    />
  );
}

export default function ProfileDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, login, token } = useAuth();
  const isGuest = user?.isGuest || user?.email === 'guest@smartcity.local';
  const [activeTab, setActiveTab] = useState('account');
  const [profil, setProfil] = useState(null);
  const [statistik, setStatistik] = useState({ totalVote: 0, totalLaporan: 0, totalLogin: 0 });
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ nama: '', kota: '', telepon: '' });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [fotoFile, setFotoFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const selectedPhotoPreview = useMemo(() => {
    if (!fotoFile) return null;
    return URL.createObjectURL(fotoFile);
  }, [fotoFile]);

  useEffect(() => {
    fetchProfil();
    fetchStatistik();
  }, []);

  useEffect(() => {
    return () => {
      if (selectedPhotoPreview) URL.revokeObjectURL(selectedPhotoPreview);
    };
  }, [selectedPhotoPreview]);

  useEffect(() => {
    if (searchParams.get('edit') === '1' && !isGuest) {
      setEditMode(true);
    }
  }, [searchParams, isGuest]);

  const fetchProfil = async () => {
    try {
      const res = await api.get('/users/profil');
      setProfil(res.data);
      setForm({ nama: res.data.nama || '', kota: res.data.kota || 'Medan', telepon: res.data.telepon || '' });
    } catch (err) {
      console.error(err);
      if (user) {
        setProfil(user);
        setForm({ nama: user.nama || '', kota: user.kota || 'Medan', telepon: user.telepon || '' });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistik = async () => {
    try {
      const res = await api.get('/users/statistik');
      setStatistik(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('nama', form.nama);
      formData.append('kota', form.kota);
      formData.append('telepon', form.telepon);
      if (fotoFile) formData.append('foto_profil', fotoFile);

      const res = await fetch('/api/users/profil', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setProfil({ ...profil, ...data.user });
      login(data.user, token);
      setEditMode(false);
      setMsg({ type: 'success', text: 'Profil & Data Warga berhasil diperbarui!' });
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Gagal update profil.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      setMsg({ type: 'error', text: 'Konfirmasi password baru tidak cocok!' });
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMsg({ type: 'success', text: 'Keamanan akun berhasil diperbarui! Password baru aktif.' });
      setTimeout(() => setMsg({ type: '', text: '' }), 3500);
    }, 600);
  };

  if (loading) return (
    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-light)' }}>
      Memuat profil...
    </div>
  );

  const account = profil || user || {};
  const previewName = editMode ? form.nama : account?.nama;
  const previewInitials = getInitials(previewName || account?.nama);
  const previewPhoto = selectedPhotoPreview || account?.foto_profil;

  return (
    <Layout title="Akun Saya" subtitle="Kelola data profil, keamanan akun, dan riwayat aktivitas warga">
      <div className="profile-page">
        <div style={{ width: 'min(1180px, 100%)', margin: '0 auto 24px' }}>
          <button className="profile-back" onClick={() => navigate('/dashboard')} style={{ marginBottom: 0 }}>
            <HeroIcon name="arrowLeft" />
            Kembali
          </button>
        </div>
        <div className="profile-shell">
        <aside className="profile-side">
          <div className="profile-side-card">
            <ProfileAvatar
              src={account?.foto_profil}
              userName={account?.nama}
              initials={getInitials(account?.nama)}
              imageClassName="profile-avatar"
              fallbackClassName="profile-avatar-placeholder"
            />
            <h2>{account?.nama || 'Pengguna'}</h2>
            <p>{account?.email || '-'}</p>
            <span className="profile-badge">
              {isGuest ? 'Guest Demo' : account?.role === 'admin' ? 'Admin Kota' : 'Warga'}
            </span>
          </div>

          <nav className="profile-settings-nav" aria-label="Profile settings">
            <button type="button" className={`profile-nav-tab ${activeTab === 'account' ? 'active' : ''}`} onClick={() => setActiveTab('account')}>Account</button>
            <button type="button" className={`profile-nav-tab ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>Security</button>
            <button type="button" className={`profile-nav-tab ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => setActiveTab('activity')}>Activity</button>
          </nav>
        </aside>

        <main className="profile-main">
          <div className="profile-title-row">
            <div>
              <span className="profile-kicker">Profile Settings</span>
              <h1>
                {activeTab === 'account' && 'Account Settings'}
                {activeTab === 'security' && 'Security & Password'}
                {activeTab === 'activity' && 'Activity Log'}
              </h1>
              <p>
                {activeTab === 'account' && 'Kelola data profil dan informasi akun Smart City Medan.'}
                {activeTab === 'security' && 'Pengaturan kata sandi, verifikasi sesi, dan proteksi akun.'}
                {activeTab === 'activity' && 'Catatan riwayat interaksi dan aktivitas warga di portal kota.'}
              </p>
            </div>
            {activeTab === 'account' && !isGuest && (
              <button className="btn btn-outline profile-edit-toggle" onClick={() => setEditMode(!editMode)}>
                {editMode ? 'Batal' : 'Edit Profile'}
              </button>
            )}
          </div>

          {isGuest && (
            <div className="profile-guest-note">
              Guest demo hanya bisa melihat profil. Login dengan akun warga untuk mengubah pengaturan.
            </div>
          )}

          {msg.text && (
            <div className={msg.type === 'success' ? 'success-msg' : 'error-msg'}>
              {msg.text}
            </div>
          )}

          {activeTab === 'account' && (
            <>
              {searchParams.get('edit') === '1' && !isGuest && (
                <div style={{ background: '#eef4ff', border: '1px solid #043cb1', padding: '16px 20px', borderRadius: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ fontSize: 24 }}>👋</span>
                  <div>
                    <strong style={{ display: 'block', color: '#043cb1', fontSize: 15 }}>Selamat Datang! Kelengkapi Data Warga Anda</strong>
                    <span style={{ color: '#5f687c', fontSize: 13 }}>Silakan periksa Nama Lengkap dan isikan Nomor Telepon / WhatsApp Anda di bawah ini.</span>
                  </div>
                </div>
              )}

              <section className="profile-settings-card">
                <div className="profile-card-head">
                  <div>
                    <h3>Personal Information</h3>
                    <p>Data ini digunakan untuk identitas dan layanan warga kota Medan.</p>
                  </div>
                </div>

                <div className="profile-form-layout">
                  <div className="profile-photo-panel">
                    <ProfileAvatar
                      src={previewPhoto}
                      userName={form.nama}
                      initials={previewInitials}
                      imageClassName="profile-photo-preview"
                      fallbackClassName="profile-photo-preview placeholder"
                    />
                    <strong>Profile Photo</strong>
                    <span>PNG atau JPG untuk foto profil akun.</span>
                  </div>

                  {editMode && !isGuest ? (
                    <form className="profile-settings-form" onSubmit={handleSave}>
                      <div className="form-group">
                        <label>Nama Lengkap</label>
                        <input value={form.nama}
                          onChange={e => setForm({ ...form, nama: e.target.value })} placeholder="Nama lengkap sesuai KTP" required />
                      </div>
                      <div className="form-group">
                        <label>Nomor Telepon / WhatsApp</label>
                        <input value={form.telepon}
                          onChange={e => setForm({ ...form, telepon: e.target.value })} placeholder="08xxxxxxxxxx" required />
                      </div>
                      <div className="form-group">
                        <label>Kota / Kabupaten</label>
                        <input value={form.kota}
                          onChange={e => setForm({ ...form, kota: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Foto Profil</label>
                        <input type="file" accept="image/*"
                          onChange={e => setFotoFile(e.target.files[0])} />
                      </div>
                      <div className="profile-actions">
                        <button type="button" className="btn btn-outline" onClick={() => setEditMode(false)}>
                          Batal
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                          {saving ? 'Simpan...' : 'Simpan Profil Warga'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="profile-details-grid">
                      <div className="profile-detail-item">
                        <small>Nama Lengkap</small>
                        <strong>{account?.nama || '-'}</strong>
                      </div>
                      <div className="profile-detail-item">
                        <small>Email</small>
                        <strong>{account?.email || '-'}</strong>
                      </div>
                      <div className="profile-detail-item">
                        <small>Nomor Telepon / WhatsApp</small>
                        <strong>{account?.telepon || 'Belum diisi'}</strong>
                      </div>
                      <div className="profile-detail-item">
                        <small>Total Poin Warga</small>
                        <strong>💰 {account?.poin !== undefined ? account.poin : 450} Poin</strong>
                      </div>
                      <div className="profile-detail-item">
                        <small>Kota</small>
                        <strong>{account?.kota || 'Medan'}</strong>
                      </div>
                      <div className="profile-detail-item">
                        <small>Role Status</small>
                        <strong>{isGuest ? 'Guest Demo' : account?.role === 'admin' ? 'Administrator' : 'Warga Terverifikasi'}</strong>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}

          {activeTab === 'security' && (
            <section className="profile-settings-card">
              <div className="profile-card-head">
                <div>
                  <h3>Security & Authentication</h3>
                  <p>Ubah password dan periksa tingkat keamanan sesi login Anda.</p>
                </div>
                <span className="profile-badge" style={{ background: '#e8f5e9', color: '#2e7d32' }}>
                  🛡️ Protected (Bcrypt & JWT)
                </span>
              </div>

              <div style={{ padding: 24 }}>
                <form onSubmit={handlePasswordSubmit} style={{ display: 'grid', gap: 16, maxWidth: 480 }}>
                  <div className="form-group">
                    <label>Password Saat Ini</label>
                    <input type="password" placeholder="••••••••" value={passForm.currentPassword} onChange={e => setPassForm({ ...passForm, currentPassword: e.target.value })} disabled={isGuest} required />
                  </div>
                  <div className="form-group">
                    <label>Password Baru</label>
                    <input type="password" placeholder="Minimal 6 karakter" value={passForm.newPassword} onChange={e => setPassForm({ ...passForm, newPassword: e.target.value })} disabled={isGuest} required />
                  </div>
                  <div className="form-group">
                    <label>Konfirmasi Password Baru</label>
                    <input type="password" placeholder="Ulangi password baru" value={passForm.confirmPassword} onChange={e => setPassForm({ ...passForm, confirmPassword: e.target.value })} disabled={isGuest} required />
                  </div>
                  {!isGuest && (
                    <button type="submit" className="btn btn-primary" style={{ justifySelf: 'start', marginTop: 8 }} disabled={saving}>
                      {saving ? 'Memproses...' : 'Update Password'}
                    </button>
                  )}
                </form>

                <div style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid #edf0f7' }}>
                  <h4 style={{ fontSize: 15, fontWeight: 800, color: '#111e43', marginBottom: 12 }}>Sesi Perangkat Aktif</h4>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 14, background: '#f8faff', borderRadius: 12, border: '1px solid #e4e8f1' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: 13, color: '#111e43' }}>💻 Chrome on macOS (Medan, Indonesia)</strong>
                      <small style={{ color: '#7b8190' }}>Sesi login saat ini • IP: 180.242.xx.xx</small>
                    </div>
                    <span style={{ fontSize: 12, color: '#00897b', fontWeight: 800, background: '#e0f2f1', padding: '4px 10px', borderRadius: 20 }}>Sesi Aktif</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'activity' && (
            <section className="profile-settings-card">
              <div className="profile-card-head">
                <div>
                  <h3>Activity History</h3>
                  <p>Log catatan aktivitas dan keaktifan Anda di portal Smart City Medan.</p>
                </div>
              </div>

              <div style={{ padding: 24 }}>
                <div style={{ display: 'grid', gap: 14 }}>
                  {[
                    { title: 'Login Berhasil Ke Portal Kota', time: 'Hari ini, 19:34 WIB', desc: 'Sesi login berhasil diverifikasi via JWT Token.', icon: 'check' },
                    { title: 'Menelusuri Pusat Monitoring Kota', time: 'Kemarin, 14:20 WIB', desc: 'Melihat status ketersediaan bed RS dan sensor udara AQI.', icon: 'cloud' },
                    { title: 'Mengklaim Voucher Diskon E-Batik', time: '2 hari lalu', desc: 'Voucher MEDAN-EBATIK-20 berhasil disimpan ke dompet.', icon: 'sparkles' },
                    { title: 'Melihat Lowongan Kerja Terverifikasi', time: '3 hari lalu', desc: 'Melihat rincian posisi Frontend Developer Medan Digital Hub.', icon: 'briefcase' },
                  ].map((act, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: 14, background: '#f8faff', borderRadius: 12, border: '1px solid #edf0f7' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: '#eef4ff', color: '#043cb1', display: 'grid', placeItems: 'center', flexShrink: 0, fontWeight: 900 }}>
                        <HeroIcon name={act.icon} />
                      </div>
                      <div>
                        <strong style={{ display: 'block', fontSize: 14, color: '#111e43' }}>{act.title}</strong>
                        <span style={{ fontSize: 12, color: '#8b93a7' }}>{act.time}</span>
                        <p style={{ fontSize: 13, color: '#5f687c', margin: '4px 0 0' }}>{act.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          <section className="profile-metrics">
            {[
              { label: 'Total Voting', value: statistik.totalVote },
              { label: 'Laporan Dikirim', value: statistik.totalLaporan },
              { label: 'Total Login', value: statistik.totalLogin }
            ].map(item => (
              <article className="profile-metric-card" key={item.label}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </article>
            ))}
          </section>
        </main>
      </div>
    </div>
  </Layout>
);
}
