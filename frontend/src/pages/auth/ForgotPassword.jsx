import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BrandLogo from '../../components/BrandLogo';
import HeroIcon from '../../components/HeroIcon';
import api from '../../utils/api';
import './auth.css';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: email, 2: jawaban+password baru
  const [email, setEmail] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleStep1 = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/forgot-password/question', { email });
      setQuestion(res.data.security_question);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Email tidak ditemukan.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return setError('Password minimal 6 karakter.');
    setLoading(true); setError('');
    try {
      await api.post('/auth/forgot-password/reset', {
        email, security_answer: answer, new_password: newPassword
      });
      setSuccess('Password berhasil direset! Silakan login.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal reset password.');
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
        <h2>Lupa Password</h2>
        <p className="subtitle">
          {step === 1 ? 'Masukkan email kamu untuk melanjutkan' : 'Jawab pertanyaan keamanan kamu'}
        </p>

        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}

        {step === 1 && (
          <form onSubmit={handleStep1}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="email@example.com"
                value={email} onChange={e => { setEmail(e.target.value); setError(''); }} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Mencari...' : 'Lanjutkan'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleStep2}>
            <div className="form-group">
              <label>Pertanyaan Keamanan</label>
              <div style={{ padding: '10px 14px', background: 'var(--off-white)',
                borderRadius: 'var(--radius-control)', fontSize: 14, color: 'var(--text-mid)',
                border: '1.5px solid var(--light-gray)' }}>
                {question}
              </div>
            </div>
            <div className="form-group">
              <label>Jawaban</label>
              <input placeholder="Jawaban kamu"
                value={answer} onChange={e => { setAnswer(e.target.value); setError(''); }} required />
            </div>
            <div className="form-group">
              <label>Password Baru</label>
              <input type="password" placeholder="Minimal 6 karakter"
                value={newPassword} onChange={e => { setNewPassword(e.target.value); setError(''); }} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <Link to="/login"><HeroIcon name="arrowLeft" /> Kembali ke Login</Link>
        </div>
      </div>
    </div>
  );
}
