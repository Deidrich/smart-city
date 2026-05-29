import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import HeroIcon from '../../components/HeroIcon';
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

export default function ProfileDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, login, token } = useAuth();
  const isGuest = user?.isGuest || user?.email === 'guest@smartcity.local';
  const [profil, setProfil] = useState(null);
  const [statistik, setStatistik] = useState({ totalVote: 0, totalLaporan: 0, totalLogin: 0 });
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ nama: '', kota: '' });
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
      setForm({ nama: res.data.nama, kota: res.data.kota });
    } catch (err) {
      console.error(err);
      if (user) {
        setProfil(user);
        setForm({ nama: user.nama || '', kota: user.kota || 'Medan' });
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
      setMsg({ type: 'success', text: 'Profil berhasil diperbarui!' });
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Gagal update profil.' });
    } finally {
      setSaving(false);
    }
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
    <div className="profile-page">
      <div className="profile-shell">
        <aside className="profile-side">
          <button className="profile-back" onClick={() => navigate('/dashboard')}>
            <HeroIcon name="arrowLeft" />
            Kembali
          </button>

          <div className="profile-side-card">
            {account?.foto_profil
              ? <img src={account.foto_profil} alt="foto profil" className="profile-avatar" />
              : <div className="profile-avatar-placeholder">
                  {getInitials(account?.nama)}
                </div>
            }
            <h2>{account?.nama || 'Pengguna'}</h2>
            <p>{account?.email || '-'}</p>
            <span className="profile-badge">
              {isGuest ? 'Guest Demo' : account?.role === 'admin' ? 'Admin Kota' : 'Warga'}
            </span>
          </div>

          <nav className="profile-settings-nav" aria-label="Profile settings">
            <span className="active">Account</span>
            <span>Security</span>
            <span>Activity</span>
          </nav>
        </aside>

        <main className="profile-main">
          <div className="profile-title-row">
            <div>
              <span className="profile-kicker">Profile Settings</span>
              <h1>Account Settings</h1>
              <p>Kelola data profil dan informasi akun Smart City Medan.</p>
            </div>
            {!isGuest && (
              <button className="btn btn-outline profile-edit-toggle" onClick={() => setEditMode(!editMode)}>
                {editMode ? 'Batal' : 'Edit Profile'}
              </button>
            )}
          </div>

          {isGuest && (
            <div className="profile-guest-note">
              Guest demo hanya bisa melihat profil. Login dengan akun warga untuk mengedit profil.
            </div>
          )}

          {msg.text && (
            <div className={msg.type === 'success' ? 'success-msg' : 'error-msg'}>
              {msg.text}
            </div>
          )}

          <section className="profile-settings-card">
            <div className="profile-card-head">
              <div>
                <h3>Personal Information</h3>
                <p>Data ini digunakan untuk identitas layanan warga.</p>
              </div>
            </div>

            <div className="profile-form-layout">
              <div className="profile-photo-panel">
                {previewPhoto
                  ? <img src={previewPhoto} alt="foto profil" className="profile-photo-preview" />
                  : <div className="profile-photo-preview placeholder">
                      {previewInitials}
                    </div>
                }
                <strong>Profile Photo</strong>
                <span>PNG atau JPG untuk foto profil akun.</span>
              </div>

              {editMode && !isGuest ? (
                <form className="profile-settings-form" onSubmit={handleSave}>
                  <div className="form-group">
                    <label>Nama Lengkap</label>
                    <input value={form.nama}
                      onChange={e => setForm({ ...form, nama: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Kota</label>
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
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? 'Menyimpan...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profile-info-grid">
                  {[
                    { label: 'Nama', value: account?.nama },
                    { label: 'Email', value: account?.email },
                    { label: 'Kota', value: account?.kota || 'Medan' },
                    { label: 'Role', value: isGuest ? 'Guest Demo' : account?.role === 'admin' ? 'Admin Kota' : 'Warga' },
                    { label: 'Bergabung', value: account?.created_at ? new Date(account.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-' }
                  ].map(item => (
                    <div className="profile-info-item" key={item.label}>
                      <span>{item.label}</span>
                      <strong>{item.value || '-'}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

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
  );
}
