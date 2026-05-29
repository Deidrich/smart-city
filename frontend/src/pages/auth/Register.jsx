import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
