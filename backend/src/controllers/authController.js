const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Log = require('../models/Log');
const { saveUserToJson } = require('../utils/userJsonStore');
require('dotenv').config();

// Helper to send OTP email
const sendOtpEmail = async (email, otp) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`\n=============================================`);
      console.log(`[SMTP MOCK] OTP untuk email ${email}: ${otp}`);
      console.log(`=============================================\n`);
      return true;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const mailOptions = {
      from: `"Smart City Medan" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Kode Verifikasi OTP - Smart City Medan',
      html: `
        <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; padding: 24px; background: #f8faff; border-radius: 12px; color: #111e43; max-width: 500px; margin: 0 auto; border: 1.5px solid #edf0f7;">
          <h2 style="color: #043cb1; margin-top: 0; font-size: 20px;">Verifikasi Akun Smart City</h2>
          <p style="font-size: 14px; line-height: 1.5;">Halo,</p>
          <p style="font-size: 14px; line-height: 1.5;">Terima kasih telah mendaftar di <strong>Smart City Medan</strong>. Silakan gunakan kode OTP di bawah ini untuk memverifikasi alamat email Anda:</p>
          <div style="font-size: 32px; font-weight: 800; text-align: center; color: #043cb1; background: #eaf1ff; padding: 12px; border-radius: 8px; margin: 20px 0; letter-spacing: 4px;">
            ${otp}
          </div>
          <p style="font-size: 12px; color: #718096; line-height: 1.5; margin-bottom: 0;">Kode OTP ini berlaku selama <strong>5 menit</strong>. Jangan bagikan kode ini kepada siapa pun demi keamanan akun Anda.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email OTP terkirim ke ${email}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`Gagal mengirim email OTP ke ${email}:`, error.message);
    console.log(`\n=============================================`);
    console.log(`[FALLBACK OTP] OTP untuk email ${email}: ${otp}`);
    console.log(`=============================================\n`);
    return false;
  }
};

// ===== REGISTER =====
const register = async (req, res) => {
  try {
    const { nama, email, password, kota, security_question, security_answer } = req.body;

    if (!nama || !email || !password || !security_question || !security_answer) {
      return res.status(400).json({ message: 'Semua field wajib diisi.' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email sudah terdaftar.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedAnswer = await bcrypt.hash(security_answer.toLowerCase().trim(), 10);

    // Create verified user directly
    const user = await User.create({
      nama,
      email,
      password: hashedPassword,
      kota: kota || 'Medan',
      security_question,
      security_answer: hashedAnswer,
      is_verified: true
    });

    saveUserToJson(user);

    await Log.create({
      nama: user.nama,
      aksi: 'REGISTER_VERIFIED',
      detail: `Pendaftaran berhasil. Email ${user.email} telah didaftarkan langsung tanpa OTP.`
    });

    return res.status(201).json({
      success: true,
      message: 'Registrasi berhasil! Silakan login.',
      user: { id: user.id, nama: user.nama, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal registrasi.', error: error.message });
  }
};

// ===== VERIFY OTP =====
const verifyOtp = async (req, res) => {
  try {
    const { email, otp, signupToken } = req.body;

    if (signupToken) {
      let decoded;
      try {
        decoded = jwt.verify(signupToken, process.env.JWT_SECRET || 'secret');
      } catch (err) {
        return res.status(400).json({ message: 'Sesi pendaftaran kadaluwarsa. Silakan mendaftar kembali.' });
      }

      if (decoded.otp !== otp) {
        return res.status(400).json({ message: 'Kode OTP yang Anda masukkan salah.' });
      }

      const existing = await User.findOne({ where: { email: decoded.email } });
      if (existing) {
        if (existing.is_verified) {
          return res.status(400).json({ message: 'Email sudah terdaftar.' });
        }
        // If unverified db record exists, update and verify it
        existing.is_verified = true;
        existing.verification_otp = null;
        existing.otp_expires_at = null;
        await existing.save();
        saveUserToJson(existing);
        return res.json({ success: true, message: 'Email berhasil diverifikasi! Silakan login.' });
      }

      // Create new user in the database
      const user = await User.create({
        nama: decoded.nama,
        email: decoded.email,
        password: decoded.password,
        kota: decoded.kota || 'Medan',
        security_question: decoded.security_question,
        security_answer: decoded.security_answer,
        is_verified: true
      });

      saveUserToJson(user);

      await Log.create({
        nama: user.nama,
        aksi: 'REGISTER_VERIFIED',
        detail: `Pendaftaran berhasil. Email ${user.email} telah diverifikasi.`
      });

      return res.json({ success: true, message: 'Registrasi berhasil dan email terverifikasi! Silakan login.' });
    }

    // Database-based verification fallback
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email dan kode OTP wajib diisi.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }

    if (user.is_verified) {
      return res.status(400).json({ message: 'Akun Anda sudah terverifikasi. Silakan login.' });
    }

    if (user.verification_otp !== otp) {
      return res.status(400).json({ message: 'Kode OTP yang Anda masukkan salah.' });
    }

    if (new Date() > new Date(user.otp_expires_at)) {
      return res.status(400).json({ message: 'Kode OTP telah kedaluwarsa. Silakan kirim ulang.' });
    }

    user.is_verified = true;
    user.verification_otp = null;
    user.otp_expires_at = null;
    await user.save();

    saveUserToJson(user);

    await Log.create({
      nama: user.nama,
      aksi: 'VERIFY_OTP_SUCCESS',
      detail: `Email ${user.email} berhasil diverifikasi.`
    });

    return res.json({ success: true, message: 'Email berhasil diverifikasi! Silakan login.' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memverifikasi OTP.', error: error.message });
  }
};

// ===== RESEND OTP =====
const resendOtp = async (req, res) => {
  try {
    const { email, signupToken } = req.body;

    if (signupToken) {
      let decoded;
      try {
        decoded = jwt.verify(signupToken, process.env.JWT_SECRET || 'secret');
      } catch (err) {
        return res.status(400).json({ message: 'Sesi pendaftaran kadaluwarsa. Silakan mendaftar kembali.' });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      const newSignupData = { ...decoded, otp };
      delete newSignupData.iat;
      delete newSignupData.exp;

      const newSignupToken = jwt.sign(newSignupData, process.env.JWT_SECRET || 'secret', { expiresIn: '15m' });

      await sendOtpEmail(decoded.email, otp);

      return res.json({ success: true, signupToken: newSignupToken, message: 'Kode OTP baru telah dikirim ke email.' });
    }

    // Database-based resend fallback
    if (!email) {
      return res.status(400).json({ message: 'Email wajib diisi.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }

    if (user.is_verified) {
      return res.status(400).json({ message: 'Akun Anda sudah terverifikasi.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verification_otp = otp;
    user.otp_expires_at = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    await sendOtpEmail(email, otp);

    return res.json({ success: true, message: 'Kode OTP baru telah dikirim ke email.' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengirim ulang OTP.', error: error.message });
  }
};

// ===== LOGIN =====
const login = async (req, res) => {
  try {
    const { email, password, remember } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password wajib diisi.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Email atau password salah.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email atau password salah.' });
    }

    if (!user.is_verified) {
      user.is_verified = true;
      await user.save();
      saveUserToJson(user);
    }

    const expiresIn = remember ? '30d' : process.env.JWT_EXPIRES_IN || '7d';
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, nama: user.nama },
      process.env.JWT_SECRET || 'secret',
      { expiresIn }
    );

    await Log.create({
      userId: user.id,
      nama: user.nama,
      aksi: 'LOGIN',
      detail: `Login berhasil`
    });

    res.json({
      message: 'Login berhasil.',
      token,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        kota: user.kota,
        role: user.role,
        foto_profil: user.foto_profil
      }
    });
  } catch (error) {
    console.error('MANUAL LOGIN ERROR:', error);
    res.status(500).json({ message: 'Gagal login: ' + error.message, error: error.message });
  }
};

// ===== GUEST LOGIN =====
const guestLogin = async (req, res) => {
  try {
    const guestUser = {
      id: 0,
      nama: 'Guest Demo',
      email: 'guest@smartcity.local',
      kota: 'Medan',
      role: 'warga',
      foto_profil: null,
      isGuest: true
    };

    const token = jwt.sign(
      { id: guestUser.id, email: guestUser.email, role: guestUser.role, nama: guestUser.nama, isGuest: true },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '12h' }
    );

    await Log.create({
      userId: guestUser.id,
      nama: guestUser.nama,
      aksi: 'LOGIN',
      detail: 'Login sebagai guest demo',
      ipAddress: req.ip
    });

    res.json({
      message: 'Masuk sebagai guest berhasil.',
      token,
      user: guestUser
    });
  } catch (error) {
    console.error('GUEST LOGIN ERROR:', error);
    res.status(500).json({ message: 'Gagal masuk sebagai guest: ' + error.message, error: error.message });
  }
};

// ===== FORGOT PASSWORD =====
const getForgotQuestion = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Email tidak ditemukan.' });
    }
    res.json({ security_question: user.security_question });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan.', error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, security_answer, new_password } = req.body;

    if (!email || !security_answer || !new_password) {
      return res.status(400).json({ message: 'Semua field wajib diisi.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Email tidak ditemukan.' });
    }

    const isAnswerMatch = await bcrypt.compare(
      security_answer.toLowerCase().trim(),
      user.security_answer
    );

    if (!isAnswerMatch) {
      return res.status(401).json({ message: 'Jawaban keamanan salah.' });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await user.update({ password: hashedPassword });
    saveUserToJson(user);

    await Log.create({
      userId: user.id,
      nama: user.nama,
      aksi: 'FORGOT_PASSWORD',
      detail: 'Password direset via security question'
    });

    res.json({ message: 'Password berhasil direset. Silakan login.' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal reset password.', error: error.message });
  }
};

// ===== LOGOUT =====
const logout = async (req, res) => {
  try {
    await Log.create({
      userId: req.user.id,
      nama: req.user.nama,
      aksi: 'LOGOUT',
      detail: 'User logout'
    });
    res.json({ message: 'Logout berhasil.' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal logout.', error: error.message });
  }
};

// ===== GOOGLE LOGIN =====
const googleLogin = async (req, res) => {
  try {
    let googleEmail = req.body.email;
    let googleName = req.body.nama;
    let googlePicture = req.body.foto_profil;

    if (req.body.credential) {
      try {
        const decoded = jwt.decode(req.body.credential);
        if (decoded && decoded.email) {
          googleEmail = decoded.email;
          googleName = decoded.name || decoded.email.split('@')[0];
          googlePicture = decoded.picture || null;
        }
      } catch (e) {
        console.error('Google token decode error:', e);
      }
    }

    if (!googleEmail) {
      googleEmail = 'warga.google@medan.go.id';
      googleName = 'Warga Google Demo';
    }

    let user = await User.findOne({ where: { email: googleEmail } });
    if (!user) {
      const dummyPassword = await bcrypt.hash('google_oauth_secret', 10);
      user = await User.create({
        nama: googleName,
        email: googleEmail,
        password: dummyPassword,
        kota: 'Medan',
        role: 'warga',
        foto_profil: googlePicture || null,
        security_question: 'Google OAuth',
        security_answer: dummyPassword,
      });
      saveUserToJson(user);
    } else if (googlePicture && user.foto_profil !== googlePicture) {
      user.foto_profil = googlePicture;
      await user.save();
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, nama: user.nama },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    await Log.create({
      userId: user.id,
      nama: user.nama,
      aksi: 'GOOGLE_LOGIN',
      detail: `Login via Google OAuth berhasil: ${user.email}`
    });

    res.json({
      message: 'Login via Google berhasil.',
      token,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
        kota: user.kota,
        foto_profil: user.foto_profil,
      }
    });
  } catch (error) {
    console.error('GOOGLE LOGIN ERROR:', error);
    res.status(500).json({ message: 'Gagal login Google: ' + error.message, error: error.message });
  }
};

module.exports = { register, verifyOtp, resendOtp, login, guestLogin, googleLogin, getForgotQuestion, resetPassword, logout };
