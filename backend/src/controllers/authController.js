const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Log = require('../models/Log');
const { saveUserToJson } = require('../utils/userJsonStore');
require('dotenv').config();

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

    const user = await User.create({
      nama, email,
      password: hashedPassword,
      kota: kota || 'Medan',
      security_question,
      security_answer: hashedAnswer
    });

    saveUserToJson(user);

    await Log.create({
      userId: user.id,
      nama: user.nama,
      aksi: 'REGISTER',
      detail: `User baru terdaftar: ${email}`
    });

    res.status(201).json({ message: 'Registrasi berhasil. Silakan login.' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal registrasi.', error: error.message });
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

module.exports = { register, login, guestLogin, googleLogin, getForgotQuestion, resetPassword, logout };
