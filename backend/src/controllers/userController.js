const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Log = require('../models/Log');
const { saveUserToJson } = require('../utils/userJsonStore');

// ===== GET PROFIL =====
const getProfil = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'security_answer', 'remember_token'] }
    });
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan.' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil profil.', error: error.message });
  }
};

// ===== UPDATE PROFIL =====
const updateProfil = async (req, res) => {
  try {
    const { nama, kota, telepon } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan.' });

    const updateData = {};
    if (nama) updateData.nama = nama;
    if (kota) updateData.kota = kota;
    if (telepon !== undefined) updateData.telepon = telepon;

    // Kalau ada upload foto baru
    if (req.file) {
      updateData.foto_profil = `/uploads/${req.file.filename}`;
    }

    await user.update(updateData);
    saveUserToJson(user);

    await Log.create({
      userId: user.id,
      nama: user.nama,
      aksi: 'EDIT_PROFIL',
      detail: 'Profil diperbarui'
    });

    res.json({
      message: 'Profil berhasil diperbarui.',
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        kota: user.kota,
        telepon: user.telepon,
        role: user.role,
        foto_profil: user.foto_profil
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update profil.', error: error.message });
  }
};

// ===== GET STATISTIK PARTISIPASI =====
const getStatistik = async (req, res) => {
  try {
    const userId = req.user.id;

    // Hitung dari log MongoDB
    const totalVote = await Log.countDocuments({ userId, aksi: 'VOTE' });
    const totalLaporan = await Log.countDocuments({ userId, aksi: 'SUBMIT_LAPORAN' });
    const totalLogin = await Log.countDocuments({ userId, aksi: 'LOGIN' });

    res.json({ totalVote, totalLaporan, totalLogin });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil statistik.', error: error.message });
  }
};

// ===== CLAIM VOUCHER =====
const claimVoucher = async (req, res) => {
  try {
    const { voucherId } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });

    const { CityVoucher } = require('../models/PublicService');
    const voucher = await CityVoucher.findByPk(voucherId);
    if (!voucher) return res.status(404).json({ success: false, message: 'Voucher tidak ditemukan.' });

    if (user.poin < voucher.poin_biaya) {
      return res.status(400).json({ success: false, message: 'Poin Anda tidak mencukupi untuk mengklaim voucher ini.' });
    }

    const newPoints = user.poin - voucher.poin_biaya;
    await user.update({ poin: newPoints });
    saveUserToJson(user);

    await Log.create({
      userId: user.id,
      nama: user.nama,
      aksi: 'CLAIM_VOUCHER',
      detail: `Klaim voucher ${voucher.nama} (${voucher.kode}) senilai ${voucher.poin_biaya} poin.`
    });

    res.json({
      success: true,
      message: `Voucher ${voucher.kode} berhasil diklaim!`,
      poin: newPoints,
      voucher
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengklaim voucher.', error: error.message });
  }
};

// ===== ADD POINTS (CASHBACK/ACTIVITY) =====
const addPoints = async (req, res) => {
  try {
    const { amount, actionDetail } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });

    const newPoints = user.poin + Number(amount);
    await user.update({ poin: newPoints });
    saveUserToJson(user);

    await Log.create({
      userId: user.id,
      nama: user.nama,
      aksi: 'EARN_POINTS',
      detail: actionDetail || `Mendapatkan ${amount} poin dari keaktifan/transaksi.`
    });

    res.json({
      success: true,
      message: `Berhasil mendapatkan ${amount} poin!`,
      poin: newPoints
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menambah poin.', error: error.message });
  }
};

module.exports = { getProfil, updateProfil, getStatistik, claimVoucher, addPoints };
