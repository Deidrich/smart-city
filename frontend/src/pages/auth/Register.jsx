import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from '../../components/BrandLogo';
import HeroIcon from '../../components/HeroIcon';
import api from '../../utils/api';
import './auth.css';

const SECURITY_QUESTIONS = [
  'Nama hewan peliharaan pertama kamu?',
  'Nama sekolah dasar kamu?',
  'Nama kota kelahiran ibu kamu?',
  'Nama panggilan masa kecil kamu?',
  'Makanan favorit kamu waktu kecil?'
];

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    nama: '', email: '', password: '', kota: 'Medan',
    security_question: SECURITY_QUESTIONS[0], security_answer: ''
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/google', { email: 'warga.google@medan.go.id', nama: 'Warga Google Demo' });
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      const googleUser = {
        id: 999,
        nama: 'Warga Google Demo',
        email: 'warga.google@medan.go.id',
        role: 'warga',
        kota: 'Medan'
      };
      const dummyToken = 'google_demo_jwt_token_medan_smartcity';
      login(googleUser, dummyToken);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      return setError('Password minimal 6 karakter.');
    }
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      setSuccess('Registrasi berhasil! Silakan login.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal registrasi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <BrandLogo className="auth-brand-logo" variant="white" />
          <p>Portal Digital Warga Kota Medan</p>
        </div>
      </div>

      <div className="auth-right">
        <h2>Buat Akun Baru</h2>
        <p className="subtitle">Daftar untuk mengakses layanan kota digital</p>

        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}

        <button type="button" className="btn btn-google" disabled={loading} onClick={handleGoogleRegister} style={{ marginBottom: 20, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, border: '1px solid #dadce0', background: '#ffffff', color: '#3c4043', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.74-.06-1.28-.19-1.84H9v3.34h4.96c-.1.83-.64 2.08-1.84 2.92l2.84 2.2c1.7-1.57 2.68-3.88 2.68-6.62z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.84-2.2c-.76.53-1.78.9-3.12.9-2.38 0-4.41-1.57-5.13-3.74L.97 13.04C2.45 15.98 5.48 18 9 18z"/>
            <path fill="#FBBC05" d="M3.87 10.78c-.19-.53-.3-1.1-.3-1.78s.11-1.25.3-1.78L.97 4.96C.35 6.19 0 7.56 0 9s.35 2.81.97 4.04l2.9-2.26z"/>
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.45 2.02.97 4.96l2.9 2.26C4.59 5.05 6.62 3.58 9 3.58z"/>
          </svg>
          Daftar dengan Google
        </button>

        <div className="auth-divider" style={{ marginBottom: 20 }}>atau daftar dengan email</div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nama Lengkap</label>
            <input name="nama" placeholder="Masukkan nama lengkap"
              value={form.nama} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" placeholder="email@example.com"
              value={form.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input name="password" type={showPass ? 'text' : 'password'}
                placeholder="Minimal 6 karakter"
                value={form.password} onChange={handleChange} required />
              <button type="button" className="password-toggle"
                onClick={() => setShowPass(!showPass)}>
                <HeroIcon name={showPass ? 'eyeSlash' : 'eye'} />
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Kota</label>
            <input name="kota" placeholder="Kota tempat tinggal"
              value={form.kota} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Pertanyaan Keamanan</label>
            <select name="security_question" value={form.security_question}
              onChange={handleChange}>
              {SECURITY_QUESTIONS.map(q => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Jawaban Keamanan</label>
            <input name="security_answer" placeholder="Jawaban kamu"
              value={form.security_answer} onChange={handleChange} required />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
          </button>
        </form>

        <div className="auth-footer">
          Sudah punya akun? <Link to="/login">Login di sini</Link>
        </div>
      </div>
    </div>
  );
}
